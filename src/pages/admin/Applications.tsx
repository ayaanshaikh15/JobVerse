import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { fetchAllApplications } from '../../lib/adminApi'
import { getInitials, statusColors, statusLabels, formatDate } from '../../lib/utils'

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchAllApplications()
      .then(data => { if (active) setApplications(data) })
      .catch(err => { if (active) toast.error(err?.message || 'Failed to load applications') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-6"><div className="h-8 w-32 skeleton" /></div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 space-y-3">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl skeleton" />)}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Applications</h1>
        <p className="text-sm text-[#6B7280]">{applications.length} application{applications.length === 1 ? '' : 's'}</p>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Student</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Job Title</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Company</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Applied</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {applications.map((app, i) => (
              <motion.tr key={app.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {getInitials(app.student?.name || '?')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">{app.student?.name || '—'}</p>
                      <p className="text-xs text-[#9CA3AF]">{app.student?.email || ''}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#111827]">{app.job?.title || '—'}</td>
                <td className="px-5 py-4 text-sm text-[#374151]">{app.job?.company || '—'}</td>
                <td className="px-5 py-4 text-sm text-[#6B7280]">{formatDate(app.created_at)}</td>
                <td className="px-5 py-4">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[app.status]}`}>
                    {statusLabels[app.status]}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <div className="text-center py-12">
            <Send size={24} className="text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">No applications yet</p>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {applications.map((app, i) => (
          <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                {getInitials(app.student?.name || '?')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111827] text-sm truncate">{app.student?.name || '—'}</p>
                <p className="text-xs text-[#6B7280] truncate">{app.student?.email || ''}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusColors[app.status]}`}>
                {statusLabels[app.status]}
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF]">Applied for <span className="font-medium text-[#374151]">{app.job?.title || '—'}</span></p>
            <p className="text-xs text-[#9CA3AF]">{app.job?.company || '—'} · {formatDate(app.created_at)}</p>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  )
}
