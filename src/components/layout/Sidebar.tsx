import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  LayoutDashboard, Briefcase, FileText, Send, User,
  Users, PlusCircle, List, LogOut, ChevronRight, AlertTriangle, X,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getInitials } from '../../lib/utils'

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/jobs', icon: Briefcase, label: 'Browse Jobs' },
  { to: '/student/resume', icon: FileText, label: 'My Resume' },
  { to: '/student/applications', icon: Send, label: 'Applications' }
]

const recruiterLinks = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruiter/post-job', icon: PlusCircle, label: 'Post a Job' },
  { to: '/recruiter/jobs', icon: List, label: 'My Jobs' },
  { to: '/recruiter/applicants', icon: Users, label: 'Applicants' }
]

export default function Sidebar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const links = profile?.role === 'recruiter' ? recruiterLinks : studentLinks

  const profilePath = profile?.role === 'recruiter' ? '/recruiter/profile' : '/student/profile'

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false)
    try {
      await logout()
      navigate('/')
    } catch (err) {
      toast.error(err?.message || 'Failed to sign out')
    }
  }

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-[#E2E8F0] px-4 py-6 fixed top-0 left-0 z-30 transition-colors duration-200">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-sm">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-semibold text-[17px] text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Job<span className="text-indigo-600">Verse</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-current'} />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="w-1.5 h-1.5 rounded-full bg-indigo-600"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#E2E8F0] pt-4 mt-4">
          {/* Account card — navigates to profile */}
          <button
            onClick={() => navigate(profilePath)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 hover:bg-[#F8FAFC] transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {profile ? getInitials(profile.name) : 'U'}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-[#111827] truncate">{profile?.name}</p>
              <p className="text-xs text-[#6B7280] truncate capitalize">{profile?.role}</p>
            </div>
            <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-indigo-400 shrink-0 transition-colors" />
          </button>

          {/* Sign out */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition-all duration-150"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-[#E2E8F0] w-full max-w-sm p-6"
            >
              {/* Close */}
              <button
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-[#F8FAFC] text-[#9CA3AF] transition-all"
              >
                <X size={16} />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={26} className="text-red-500" />
              </div>

              {/* Copy */}
              <h3
                className="text-lg font-bold text-[#111827] text-center mb-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Sign out of JobVerse?
              </h3>
              <p className="text-sm text-[#6B7280] text-center mb-6 leading-relaxed">
                You&apos;ll need to sign back in to access your dashboard, applications, and saved jobs.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#374151] bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-all"
                >
                  Stay
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
