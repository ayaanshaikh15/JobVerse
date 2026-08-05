import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, FileText, Send, User, Users, PlusCircle, List } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/student/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/student/resume', icon: FileText, label: 'Resume' },
  { to: '/student/applications', icon: Send, label: 'Applied' },
  { to: '/student/profile', icon: User, label: 'Profile' },
]

const recruiterLinks = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/recruiter/post-job', icon: PlusCircle, label: 'Post' },
  { to: '/recruiter/jobs', icon: List, label: 'Jobs' },
  { to: '/recruiter/applicants', icon: Users, label: 'Candidates' },
  { to: '/recruiter/profile', icon: User, label: 'Profile' },
]

export default function MobileNav() {
  const { profile } = useAuth()
  const links = profile?.role === 'recruiter' ? recruiterLinks : studentLinks

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-indigo-600' : 'text-[#6B7280]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
