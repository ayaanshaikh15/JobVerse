import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Logo from '../../components/Logo'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) return toast.error('Please fill in all fields')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { session } = await register(email, password, name)
      if (session) {
        toast.success("Account created! Let's choose your role.")
        navigate('/role-select')
      } else {
        toast.success('Account created! Check your email to verify your account.')
        navigate('/login')
      }
    } catch (err) {
      toast.error(err?.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white'

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8">
          <Logo size={36} textSize={20} />
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#E2E8F0]">
          <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Create your account</h1>
          <p className="text-sm text-[#6B7280] mb-8">Start your journey with JobVerse</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Full Name</label>
              <input type="text" className={inputCls} placeholder="Aarav Mehta" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email</label>
              <input type="email" className={inputCls} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className={`${inputCls} pr-11`} placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-md hover:shadow-lg mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
