import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  GraduationCap, Briefcase, ArrowRight, Building2,
  ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { COMPANY_REGISTRY } from '../../lib/companies'

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
  const { profile, setRole, updateProfile, isProfileComplete, onboardingPath } = useAuth()
  const navigate = useNavigate()

  const [selected, setSelected] = useState(profile?.role || 'student')
  const [companyId, setCompanyId] = useState('')
  const [showId, setShowId] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(
    profile?.role === 'recruiter' && profile?.college ? { name: profile.college, domain: '' } : null,
  )
  const [idError, setIdError] = useState('')
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
    if (profile.role === 'recruiter' && profile.college && !verified) {
      setVerified({ name: profile.college, domain: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const selectRole = (r) => {
    roleTouched.current = true
    setSelected(r)
    setVerified(null)
    setIdError('')
    setCompanyId('')
  }

  const handleVerify = async () => {
    if (!companyId.trim()) { setIdError('Please enter your company ID'); return }
    setVerifying(true)
    setIdError('')
    setVerified(null)
    await new Promise(r => setTimeout(r, 900))
    const match = COMPANY_REGISTRY[companyId.trim().toUpperCase()]
    if (match) {
      setVerified(match)
      toast.success(`Verified! You're from ${match.name} ✓`)
    } else {
      setIdError('Invalid company ID. Contact your HR team for the correct ID.')
    }
    setVerifying(false)
  }

  const handleContinue = async () => {
    if (!selected) return toast.error('Please select a role to continue')
    if (selected === 'recruiter' && !verified) { setIdError('Please verify your company ID before continuing'); return }
    setLoading(true)
    continuing.current = true
    try {
      await setRole(selected)
      if (selected === 'recruiter' && verified) await updateProfile({ college: verified.name })
      toast.success("Great! Now let's finish setting up your profile.")
      navigate(selected === 'recruiter' ? '/recruiter/profile' : '/student/profile')
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canContinue = selected === 'student' || (selected === 'recruiter' && !!verified)

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

        <AnimatePresence>
          {selected === 'recruiter' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-5"
            >
              <div className={`bg-white rounded-2xl border-2 p-5 shadow-card transition-colors ${verified ? 'border-green-300' : idError ? 'border-red-200' : 'border-cyan-200'}`}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">Company Verification</p>
                    <p className="text-xs text-[#6B7280]">Enter your unique company ID to verify employment</p>
                  </div>
                </div>

                {verified ? (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3.5">
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-800">{verified.name}</p>
                      {verified.domain && <p className="text-xs text-green-600">{verified.domain}</p>}
                    </div>
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                    <button onClick={() => { setVerified(null); setCompanyId('') }} className="text-xs text-green-600 hover:text-green-800 underline shrink-0">Change</button>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showId ? 'text' : 'password'}
                          value={companyId}
                          onChange={e => { setCompanyId(e.target.value); setIdError('') }}
                          onKeyDown={e => e.key === 'Enter' && handleVerify()}
                          placeholder="e.g. STRIPE-2024-XK9"
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] pr-10 focus:outline-none transition-all bg-white ${idError ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-[#E2E8F0] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'}`}
                        />
                        <button type="button" onClick={() => setShowId(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                          {showId ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <button
                        onClick={handleVerify}
                        disabled={verifying || !companyId.trim()}
                        className="flex items-center gap-1.5 bg-cyan-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                      >
                        {verifying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShieldCheck size={14} /> Verify</>}
                      </button>
                    </div>

                    {idError && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
                        <AlertCircle size={12} /> {idError}
                      </motion.p>
                    )}

                    <div className="mt-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <p className="text-[11px] font-semibold text-[#374151] mb-1.5">Demo company IDs to try:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['STRIPE-2024-XK9', 'FIGMA-2024-MN4', 'DEMO-COMPANY-01'].map(id => (
                          <button key={id} onClick={() => { setCompanyId(id); setIdError('') }} className="text-[11px] font-mono bg-white border border-[#E2E8F0] text-[#6B7280] hover:border-cyan-300 hover:text-cyan-700 px-2 py-1 rounded-lg transition-all">
                            {id}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{selected === 'recruiter' && !verified ? 'Verify company to continue' : 'Continue'}<ArrowRight size={16} /></>}
        </button>
      </motion.div>
    </div>
  )
}
