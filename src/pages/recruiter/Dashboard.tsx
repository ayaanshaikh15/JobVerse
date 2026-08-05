import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Users, TrendingUp, PlusCircle, List, ArrowRight, ChevronRight, Clock, XCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useRecruiterJobs } from '../../hooks/useJobs'
import { useRecruiterApplications } from '../../hooks/useApplications'
import { useAuth } from '../../hooks/useAuth'
import { statusColors, statusLabels, formatDate } from '../../lib/utils'

export default function RecruiterDashboard() {
  const { user, profile } = useAuth()
  const { jobs: myJobs, loading: jobsLoading } = useRecruiterJobs(user?.id)
  const { applications: applicants, loading: appsLoading } = useRecruiterApplications(user?.id)

  const loading = jobsLoading || appsLoading

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-gray-200 mb-3" />
              <div className="h-7 w-12 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 py-4 border-t border-[#F1F5F9]">
                <div className="w-9 h-9 rounded-xl bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5">
            <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 py-3 border-t border-[#F1F5F9]">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-3 w-28 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const activeJobs = myJobs.slice(0, 4)
  const recentApplicants = applicants.slice(0, 4)

  const stats = [
    { label: 'Jobs Posted', value: myJobs.length, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', change: 'All time' },
    { label: 'Total Applicants', value: applicants.length, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50', change: 'All time' },
    { label: 'Interviews', value: applicants.filter(a => a.status === 'interview').length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', change: 'Scheduled' },
    { label: 'Accepted', value: applicants.filter(a => a.status === 'accepted').length, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', change: 'All time' },
  ]

  const quickActions = [
    { label: 'Post a Job', desc: 'Create a new listing', to: '/recruiter/post-job', gradient: 'from-indigo-500 to-violet-600', icon: PlusCircle },
    { label: 'Manage Jobs', desc: 'Edit or delete listings', to: '/recruiter/jobs', gradient: 'from-cyan-500 to-blue-600', icon: List },
    { label: 'View Applicants', desc: 'Review candidates', to: '/recruiter/applicants', gradient: 'from-green-500 to-emerald-600', icon: Users },
  ]

  return (
    <DashboardLayout>
      {profile?.status === 'pending' && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700">Account pending approval</p>
            <p className="text-xs text-amber-600 mt-0.5">Your company registration is awaiting admin approval. You will be able to post jobs once approved.</p>
          </div>
        </div>
      )}
      {profile?.status === 'rejected' && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <XCircle size={16} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Company registration rejected</p>
            <p className="text-xs text-red-600 mt-0.5">Your company registration was rejected by the admin. Contact support if you believe this is a mistake.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg, change }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card"
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-bold text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{label}</p>
            <p className="text-[10px] text-green-600 mt-1 font-medium">{change}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-[#374151] mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {quickActions.map(({ label, desc, to, gradient, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="card-lift group bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                <Icon size={19} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{label}</p>
                <p className="text-xs text-[#6B7280]">{desc}</p>
              </div>
              <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-indigo-400 shrink-0" />
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Active jobs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
            <h2 className="text-sm font-semibold text-[#111827]">Active Job Listings</h2>
            <Link to="/recruiter/jobs" className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {activeJobs.map(job => (
              <div key={job.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{job.title}</p>
                  <p className="text-xs text-[#6B7280]">{job.location} · {formatDate(job.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-indigo-600">{job.salary}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">{applicants.filter(a => a.job_id === job.id).length} applicants</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent applicants */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
            <h2 className="text-sm font-semibold text-[#111827]">Recent Applicants</h2>
            <Link to="/recruiter/applicants" className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {recentApplicants.map(app => (
              <div key={app.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {app.profile?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{app.profile?.name || 'Unknown'}</p>
                  <p className="text-xs text-[#6B7280] truncate">{app.job?.title || '—'}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusColors[app.status]}`}>
                  {statusLabels[app.status]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
