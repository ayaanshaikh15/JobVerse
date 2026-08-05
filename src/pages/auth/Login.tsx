import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Briefcase, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, isProfileComplete, onboardingPath } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      const loggedInProfile = await login(email, password)
      toast.success('Welcome back! 🎉')
      const role = loggedInProfile?.role
      const destination = !isProfileComplete(loggedInProfile)
        ? onboardingPath(loggedInProfile)
        : role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'
      setTimeout(() => navigate(destination), 300)
    } catch (err) {
      toast.error(err?.message || 'Invalid credentials. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white'

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md">
            <Briefcase size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Job<span className="text-indigo-600">Verse</span>
          </span>
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#E2E8F0]">
          <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Welcome back
          </h1>
          <p className="text-sm text-[#6B7280] mb-8">Sign in to your JobVerse account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email</label>
              <input type="email" className={inputCls} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#374151]">Password</label>
                <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className={`${inputCls} pr-11`} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-md hover:shadow-lg mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-5 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs text-indigo-700 font-medium mb-1">Signed in on another device?</p>
            <p className="text-xs text-indigo-600">Your session persists across refreshes. Use the account you registered with.</p>
          </div>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
