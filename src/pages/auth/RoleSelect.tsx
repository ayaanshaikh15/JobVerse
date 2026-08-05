import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const roles = [
  {
    id: 'student',
    icon: GraduationCap,
    title: "I'm a Student",
    subtitle: 'Looking for jobs or internships',
    color: 'from-indigo-500 to-violet-600',
    activeBorder: 'border-indigo-500 bg-indigo-50/50',
  },
  {
    id: 'recruiter',
    icon: Briefcase,
    title: "I'm a Recruiter",
    subtitle: 'Hiring the best talent',
    color: 'from-cyan-500 to-teal-600',
    activeBorder: 'border-cyan-500 bg-cyan-50/50',
  },
]

export default function RoleSelect() {
  const { profile, setRole, isProfileComplete, onboardingPath } = useAuth()
  const navigate = useNavigate()

  const [selected, setSelected] = useState(profile?.role || 'student')
  const [loading, setLoading] = useState(false)
  const roleTouched = useRef(false)
  const continuing = useRef(false)

  useEffect(() => {
    if (!profile) return
    // A role is chosen once per account: completed or already-onboarded users
    // are never shown the role picker again.
    if (!continuing.current) {
      if (isProfileComplete(profile)) {
        navigate(profile.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard', { replace: true })
        return
      }
      if (profile.onboarded) {
        navigate(onboardingPath(profile), { replace: true })
        return
      }
    }
    if (!roleTouched.current && profile.role) setSelected(profile.role)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const selectRole = (r) => {
    roleTouched.current = true
    setSelected(r)
  }

  const handleContinue = async () => {
    if (!selected) return toast.error('Please select a role to continue')
    setLoading(true)
    continuing.current = true
    try {
      await setRole(selected)
      toast.success("Great! Now let's finish setting up your profile.")
      navigate(selected === 'recruiter' ? '/recruiter/profile' : '/student/profile')
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>How will you use JobVerse?</h1>
          <p className="text-[#6B7280]">Choose your role — you can complete your details next</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          {roles.map(({ id, icon: Icon, title, subtitle, color, activeBorder }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => selectRole(id)}
              className={`text-left bg-white rounded-3xl p-6 border-2 transition-all duration-200 shadow-card ${selected === id ? activeBorder : 'border-[#E2E8F0] hover:border-indigo-300'}`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-sm`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-semibold text-[#111827] text-base mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h3>
              <p className="text-xs text-[#6B7280]">{subtitle}</p>
            </motion.button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
        </button>
      </motion.div>
    </div>
  )
}
