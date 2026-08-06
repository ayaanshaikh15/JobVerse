import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Sparkles, Upload, MousePointerClick, Building2,
  ArrowRight, Star, Users, TrendingUp, CheckCircle2, Zap, Sun, Moon, Menu, X,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import Logo from '../components/Logo'

const companies = ['Stripe', 'Figma', 'Notion', 'Linear', 'Vercel', 'Razorpay', 'CRED', 'Swiggy']

const features = [
  {
    icon: Sparkles,
    title: 'AI Resume Builder',
    desc: 'Generate an ATS-optimized resume in minutes using AI. Tailored to your target role.',
    color: 'from-violet-500 to-indigo-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Briefcase,
    title: 'Browse 10,000+ Jobs',
    desc: 'Filter by role, location, salary, and type. New opportunities added every day.',
    color: 'from-indigo-500 to-cyan-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: Upload,
    title: 'Resume Upload',
    desc: 'Upload your existing resume as PDF. Stored securely and reused across all applications.',
    color: 'from-cyan-500 to-teal-500',
    bg: 'bg-cyan-50',
  },
  {
    icon: MousePointerClick,
    title: 'One-Click Apply',
    desc: 'Apply to any job instantly with your resume pre-attached. No forms, no friction.',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
  },
  {
    icon: Building2,
    title: 'Recruiter Hiring',
    desc: 'Post jobs, review applicants, and manage your hiring pipeline in one place.',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
  },
  {
    icon: TrendingUp,
    title: 'Track Applications',
    desc: 'Monitor your application status in real-time from applied to interview to offer.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
  },
]

const stats = [
  { value: '10,000+', label: 'Active Jobs', icon: Briefcase },
  { value: '2,400+', label: 'Companies', icon: Building2 },
  { value: '45,000+', label: 'Students Placed', icon: Users },
  { value: '94%', label: 'Success Rate', icon: Star },
]

// Floating job preview cards
const floatingCards = [
  { title: 'Frontend Engineer', company: 'Stripe', salary: '$140k', type: 'Full-time', color: 'from-indigo-500 to-violet-600' },
  { title: 'Product Designer', company: 'Figma', salary: '$120k', type: 'Full-time', color: 'from-cyan-500 to-blue-600' },
  { title: 'Data Scientist', company: 'Google', salary: '$160k', type: 'Internship', color: 'from-green-500 to-emerald-600' },
]

export default function Landing() {
  const { isDark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={32} textSize={17} />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#6B7280]">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#companies" className="hover:text-primary transition-colors">Companies</a>
            <Link to="/jobs" className="hover:text-primary transition-colors">Browse Jobs</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-300 transition-all text-[#6B7280]"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
            <Link
              to="/login"
              className="hidden sm:inline-block text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex text-sm font-semibold bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              Get started
            </Link>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-300 transition-all text-[#6B7280]"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-[#E2E8F0] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
            >
              <div className="px-4 py-4 space-y-1">
                <a href="#features" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F8FAFC] transition-colors">Features</a>
                <a href="#companies" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F8FAFC] transition-colors">Companies</a>
                <Link to="/jobs" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F8FAFC] transition-colors">Browse Jobs</Link>
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-medium text-[#6B7280] border border-[#E2E8F0] px-4 py-2.5 rounded-xl hover:border-indigo-300 transition-colors">Sign in</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-semibold bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">Get started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
              <Zap size={12} />
              AI-powered job matching
            </div>

            <h1
              className="text-5xl sm:text-6xl font-bold text-[#111827] leading-[1.1] mb-6"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Find Your{' '}
              <span className="gradient-text">Dream Job</span>
              <br />
              with AI Resume
              <br />
              Builder
            </h1>

            <p className="text-lg text-[#6B7280] mb-8 leading-relaxed max-w-lg">
              Create an ATS-friendly resume powered by AI, discover top opportunities, and apply with one click — all in one beautifully designed platform.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="flex items-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg text-sm"
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/student/jobs"
                className="flex items-center gap-2 bg-white text-[#111827] px-7 py-3.5 rounded-xl font-semibold border border-[#E2E8F0] hover:border-indigo-300 hover:shadow-md transition-all text-sm"
              >
                <Briefcase size={16} />
                Browse Jobs
              </Link>
            </div>

            {/* Trust line */}
            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-2">
                {['4F46E5', '06B6D4', '22C55E', 'F59E0B'].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: `#${c}` }}>
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6B7280]">
                <span className="font-semibold text-[#111827]">45,000+</span> students already placed
              </p>
            </div>
          </motion.div>

          {/* Right – floating cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative h-[460px] hidden lg:block"
          >
            {/* Gradient orbs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-200/30 rounded-full blur-3xl" />
            </div>

            {/* Main card */}
            <motion.div
              className="float-1 absolute top-8 left-8 right-8 bg-white rounded-3xl p-6 shadow-[0_20px_60px_-10px_rgba(79,70,229,0.2)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-sm">
                  <Briefcase size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#111827] text-sm">Frontend Engineer</p>
                  <p className="text-xs text-[#6B7280]">Stripe · San Francisco</p>
                </div>
                <span className="ml-auto text-xs font-semibold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-lg">$140k</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['React', 'TypeScript', 'GraphQL'].map(s => (
                  <span key={s} className="text-[11px] bg-[#F8FAFC] text-[#6B7280] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">{s}</span>
                ))}
              </div>
              <button className="w-full mt-4 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors">
                Apply Now
              </button>
            </motion.div>

            {/* Stats card */}
            <motion.div
              className="float-2 absolute bottom-4 right-4 bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.1)] w-44"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-green-600" />
                </div>
                <span className="text-xs font-semibold text-[#111827]">Hired!</span>
              </div>
              <p className="text-xs text-[#6B7280]">Arjun got placed at</p>
              <p className="text-sm font-bold text-[#111827]">Razorpay</p>
              <p className="text-xs text-green-600 font-medium mt-1">↑ ₹24 LPA package</p>
            </motion.div>

            {/* AI badge */}
            <motion.div
              className="float-3 absolute bottom-32 left-0 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl p-3.5 shadow-[0_8px_30px_rgba(79,70,229,0.3)] text-white"
            >
              <Sparkles size={18} className="mb-1.5" />
              <p className="text-xs font-semibold">AI Resume</p>
              <p className="text-[10px] opacity-80">ATS Score: 97%</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 text-center shadow-card border border-[#E2E8F0]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                <Icon size={18} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Everything you need</span>
          <h2 className="text-4xl font-bold text-[#111827] mt-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Built for the modern job seeker
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-xl mx-auto">
            From AI resume generation to one-click applications — every feature is designed to get you hired faster.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-lift bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-card"
            >
              <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon size={15} className="text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-[#111827] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Companies */}
      <section id="companies" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-[#6B7280] mb-8">Trusted by top companies</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {companies.map(c => (
              <span key={c} className="text-lg font-bold text-[#CBD5E1] hover:text-[#9CA3AF] transition-colors cursor-default" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-3xl p-12 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Ready to land your dream job?
            </h2>
            <p className="text-indigo-100 mb-8 text-lg">
              Join 45,000+ students who found their perfect role through JobVerse.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/register"
                className="flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
              >
                Start for free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all text-sm"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={28} textSize={14} />
          </div>
          <p className="text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} JobVerse. Built for the next generation of talent.
          </p>
          <div className="flex gap-6 text-xs text-[#6B7280]">
            <a href="#" className="hover:text-[#111827] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#111827] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#111827] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
