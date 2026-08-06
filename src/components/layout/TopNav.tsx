import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { getInitials } from '../../lib/utils'
import Logo from '../Logo'

export default function TopNav() {
  const { profile } = useAuth()
  const { isDark, toggle } = useTheme()
  const [showNotifs, setShowNotifs] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[#E2E8F0] px-4 md:px-6 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="lg:hidden">
          <Logo size={28} textSize={14} />
        </Link>

        <div className="hidden lg:block">
          <p className="text-sm text-[#6B7280]">
            {greeting}, <span className="font-semibold text-[#111827]">{profile?.name?.split(' ')[0]}</span> 👋
          </p>
        </div>

        <div className="flex items-center gap-2 ml-auto">
        

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-300 transition-all text-[#6B7280] hover:text-indigo-600"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark
              ? <Sun size={16} className="text-amber-400" />
              : <Moon size={16} />
            }
          </button>

          <div className="relative">
            {/* <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-300 transition-all"
            >
              <Bell size={16} className="text-[#6B7280]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </button> */}

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E2E8F0] p-4 z-50">
                <p className="text-sm font-semibold text-[#111827] mb-3">Notifications</p>
                {[
                  { text: 'Your application at Razorpay was accepted!', time: '2h ago', dot: 'bg-green-500' },
                  { text: 'Stripe viewed your resume', time: '5h ago', dot: 'bg-indigo-500' },
                  { text: 'New job matches your profile', time: '1d ago', dot: 'bg-cyan-500' },
                ].map((n, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
                    <div>
                      <p className="text-xs text-[#374151]">{n.text}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to={profile?.role === 'recruiter' ? '/recruiter/profile' : profile?.role === 'admin' ? '/admin/profile' : '/student/profile'}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              profile ? getInitials(profile.name) : 'U'
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
