import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { Send, FileText, ArrowUpRight, Calendar, CalendarClock, MessageSquare } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useStudentApplications } from '../../hooks/useApplications'
import { useAuth } from '../../hooks/useAuth'
import { statusColors, statusLabels, formatDate } from '../../lib/utils'

const statusOrder = ['interview', 'attended', 'reviewing', 'applied', 'accepted', 'rejected']

const filterChips = [
  { label: 'All', value: null },
  { label: 'Under Review', value: 'reviewing' },
  { label: 'Interview', value: 'interview' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
]

function formatInterview(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function Applications() {
  const { user } = useAuth()
  const { applications, loading } = useStudentApplications(user?.id)
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get('status')
  const filtered = statusFilter
    ? applications.filter(a => a.status === statusFilter)
    : applications
  const sorted = [...filtered].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-6"><div className="h-8 w-40 skeleton" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}
        </div>
      </DashboardLayout>
    )
  }

  if (sorted.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-4">
            <Send size={28} className="text-[#CBD5E1]" />
          </div>
          <p className="font-semibold text-[#374151]">
            {statusFilter ? 'No applications in this stage' : 'No applications yet'}
          </p>
          <p className="text-sm text-[#6B7280] mt-1">
            {statusFilter ? 'Applications in this stage will appear here' : 'Start applying to jobs and track your progress here'}
          </p>
          {statusFilter ? (
            <Link to="/student/applications" className="inline-block mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700">
              View all applications →
            </Link>
          ) : (
            <Link to="/student/jobs" className="inline-block mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700">
              Browse Jobs →
            </Link>
          )}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
          My Applications
        </h1>
        <p className="text-sm text-[#6B7280]">
          {sorted.length} {sorted.length === 1 ? 'application' : 'applications'}
          {statusFilter ? ` · ${statusLabels[statusFilter]}` : ''}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {filterChips.map(({ label, value }) => {
          const active = (value ?? null) === statusFilter
          return (
            <Link
              key={label}
              to={value ? `/student/applications?status=${value}` : '/student/applications'}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-[#6B7280] border-[#E2E8F0] hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', count: applications.length, bg: 'bg-indigo-50', border: 'border-indigo-100', countCls: 'text-indigo-700', labelCls: 'text-indigo-600' },
          { label: 'Reviewing', count: applications.filter(a => a.status === 'reviewing').length, bg: 'bg-amber-50', border: 'border-amber-100', countCls: 'text-amber-700', labelCls: 'text-amber-600' },
          { label: 'Interview', count: applications.filter(a => a.status === 'interview').length, bg: 'bg-purple-50', border: 'border-purple-100', countCls: 'text-purple-700', labelCls: 'text-purple-600' },
          { label: 'Accepted', count: applications.filter(a => a.status === 'accepted').length, bg: 'bg-green-50', border: 'border-green-100', countCls: 'text-green-700', labelCls: 'text-green-600' },
        ].map(({ label, count, bg, border, countCls, labelCls }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${countCls}`} style={{ fontFamily: 'Poppins, sans-serif' }}>{count}</p>
            <p className={`text-xs ${labelCls} font-medium`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-lift bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-600 font-bold text-base shrink-0">
                {app.job?.company?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-[#111827] text-sm">{app.job?.title}</h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">{app.job?.company} · {app.job?.location}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-[#F1F5F9]">
                  <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <Calendar size={12} />Applied {formatDate(app.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <FileText size={12} />Resume attached
                  </span>
                  <Link
                    to={`/student/jobs/${app.job_id}`}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700 ml-auto"
                  >
                    View Job <ArrowUpRight size={12} />
                  </Link>
                </div>

                {app.status === 'interview' && app.interview_at && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-start gap-2.5 bg-purple-50 border border-purple-200 rounded-xl p-3.5"
                  >
                    <CalendarClock size={16} className="text-purple-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-purple-800">Interview Scheduled</p>
                      <p className="text-xs text-purple-700 mt-0.5">{formatInterview(app.interview_at)}</p>
                      {app.note && (
                        <p className="flex items-start gap-1.5 text-xs text-purple-700 mt-2 pt-2 border-t border-purple-100">
                          <MessageSquare size={12} className="shrink-0 mt-0.5" /> {app.note}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {app.status === 'reviewing' && app.note && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5"
                  >
                    <MessageSquare size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">{app.note}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  )
}
