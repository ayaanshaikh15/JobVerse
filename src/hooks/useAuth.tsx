import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.error('Failed to load profile:', error.message)
    return null
  }
  return data
}

/**
 * Guarantees a profiles row exists for the given auth user (inserts a minimal
 * row only when missing — never overwrites existing data). Falls back safely
 * when the DB trigger isn't configured yet.
 */
async function ensureProfileRow(authUser) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
        email: authUser.email,
        role: 'student',
        onboarded: false,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )
  if (error) {
    console.error('ensureProfileRow:', error.message)
  }
  return fetchProfile(authUser.id)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const refreshProfile = async (authUser) => {
      const p = await ensureProfileRow(authUser)
      if (active) setProfile(p)
    }

    // Keep loading true until the profile has actually been loaded, otherwise
    // the router would redirect to /role-select before the profile arrives.
    const finishLoading = () => {
      if (active) setLoading(false)
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        refreshProfile(sessionUser).finally(finishLoading)
      } else {
        setProfile(null)
        finishLoading()
      }
    })

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        await refreshProfile(sessionUser)
      }
      finishLoading()
    })

    return () => {
      active = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const p = await ensureProfileRow(data.user)
    setUser(data.user)
    setProfile(p)
    return p
  }

  const register = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw error
    const sessionUser = data.session?.user ?? data.user ?? null
    setUser(sessionUser)
    if (sessionUser) {
      const p = await ensureProfileRow(sessionUser)
      setProfile(p)
    }
    return { user: data.user, session: data.session }
  }

  const setRole = async (role) => {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, role, onboarded: true }, { onConflict: 'id' })
      .select()
      .maybeSingle()
    if (error) throw error
    if (data) setProfile((prev) => ({ ...prev, ...data }))
  }

  const updateProfile = async (updates) => {
    if (!user) return null
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
      .select()
      .maybeSingle()
    if (error) throw error
    if (data) setProfile((prev) => ({ ...prev, ...data }))
    return data ?? null
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }

  const isProfileComplete = useCallback((p) => {
    if (!p) return false
    if (!p.role) return false
    if (!p.name || !p.name.trim()) return false
    if (!p.phone || !p.phone.trim()) return false
    if (p.role === 'student' && !p.college) return false
    if (p.role === 'recruiter' && !p.college) return false
    return true
  }, [])

  // Where an incomplete profile should be sent: role-select until a role is
  // chosen once (onboarded), then straight to that role's profile page.
  const onboardingPath = useCallback((p) => {
    if (!p || !p.onboarded) return '/role-select'
    return p.role === 'recruiter' ? '/recruiter/profile' : '/student/profile'
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, setRole, logout, updateProfile, isProfileComplete, onboardingPath }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
