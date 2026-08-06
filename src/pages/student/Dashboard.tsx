import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Upload, Briefcase, Send, TrendingUp, BookmarkCheck, Clock, ArrowRight, ChevronRight } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../hooks/useAuth'
import { useJobs, useSavedJobs } from '../../hooks/useJobs'
import { useStudentApplications } from '../../hooks/useApplications'
import { statusColors, statusLabels, formatDate, typeColors } from '../../lib/utils'

const quickActions = [
  {
    icon: Sparkles,
    label: 'AI Resume',
    desc: 'Generate ATS resume',
    to: '/student/resume',
    gradient: 'from-violet-500 to-indigo-600',
    bg: 'from-violet-50 to-indigo-50',
  },
  {
    icon: Upload,
    label: 'Upload Resume',
    desc: 'PDF upload',
    to: '/student/resume',
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'from-cyan-50 to-blue-50',
  },
  {
    icon: Briefcase,
    label: 'Browse Jobs',
    desc: '10k+ openings',
    to: '/student/jobs',
    gradient: 'from-indigo-500 to-violet-600',
    bg: 'from-indigo-50 to-violet-50',
  },
  {
    icon: Send,
    label: 'Applications',
    desc: 'Track status',
    to: '/student/applications',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'from-green-50 to-emerald-50',
  },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const { jobs } = useJobs()
  const { applications } = useStudentApplications(user?.id)
  const { saved } = useSavedJobs(user?.id)
  const recentJobs = jobs.slice(0, 4)

  const stats = [
    { label: 'Applications', value: applications.length, icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Under Review', value: applications.filter(a => a.status === 'reviewing').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Saved Jobs', value: saved.length, icon: BookmarkCheck, color: 'text-cyan-600', bg: 'bg-cyan-50', to: '/student/saved' },
  ]

  return (
    <DashboardLayout>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg, to }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card"
          >
            <Link to={to ?? '#'}>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-2xl font-bold text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-[#374151] mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, desc, to, gradient, bg }) => (
            <Link
              key={label}
              to={to}
              className="card-lift group bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col gap-3"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{label}</p>
                <p className="text-xs text-[#6B7280]">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
            <h2 className="text-sm font-semibold text-[#111827]">Recommended Jobs</h2>
            <Link to="/student/jobs" className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9] dark:divide-y-0">
            {recentJobs.map(job => (
              <Link
                key={job.id}
                to={`/student/jobs/${job.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center shrink-0 text-indigo-600 font-bold text-sm">
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{job.title}</p>
                  <p className="text-xs text-[#6B7280] truncate">{job.company} · {job.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-indigo-600">{job.salary}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${job.type ? typeColors[job.type] : ''}`}>
                    {job.type === 'internship' ? 'Intern' : 'Full-time'}
                  </span>
                </div>
                <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-indigo-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
            <h2 className="text-sm font-semibold text-[#111827]">Recent Applications</h2>
            <Link to="/student/applications" className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-3">
                <Send size={20} className="text-[#CBD5E1]" />
              </div>
              <p className="text-sm font-semibold text-[#374151]">No applications yet</p>
              <p className="text-xs text-[#6B7280] mt-1">Start applying to jobs and track your progress here</p>
              <Link to="/student/jobs" className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-600 font-medium hover:text-indigo-700">
                Browse Jobs →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {applications.slice(0, 4).map(app => (
                <div key={app.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-[#111827] truncate mr-2">{app.job?.title}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusColors[app.status]}`}>
                      {statusLabels[app.status]}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">{app.job?.company} · {formatDate(app.created_at)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Resume banner */}
        
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
