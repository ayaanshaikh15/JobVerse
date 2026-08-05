import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Search, Building2, CheckCircle2, XCircle, Globe, Mail, User } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { fetchAllRecruiters, updateRecruiterStatus } from '../../lib/adminApi'
import { getInitials, formatDate, recruiterStatusColors, recruiterStatusLabels } from '../../lib/utils'

export default function Recruiters() {
  const [recruiters, setRecruiters] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    let active = true
    fetchAllRecruiters()
      .then(data => { if (active) setRecruiters(data) })
      .catch(err => { if (active) toast.error(err?.message || 'Failed to load recruiters') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = recruiters.filter(r => {
    const q = query.toLowerCase()
    return !q ||
      (r.college?.toLowerCase().includes(q) || false) ||
      (r.name?.toLowerCase().includes(q) || false)
  })

  const handleStatus = async (recruiter, status) => {
    setUpdatingId(recruiter.id)
    try {
      const updated = await updateRecruiterStatus(recruiter.id, status)
      setRecruiters(prev => prev.map(r => (r.id === updated.id ? { ...r, status: updated.status } : r)))
      toast.success(status === 'approved' ? `${recruiter.college || 'Recruiter'} approved` : `${recruiter.college || 'Recruiter'} rejected`)
    } catch (err) {
      toast.error(err?.message || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

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

  const renderActions = (r) => {
    if (updatingId === r.id) {
      return <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    }
    return (
      <div className="flex gap-1.5 flex-wrap">
        {r.status !== 'approved' && (
          <button
            onClick={() => handleStatus(r, 'approved')}
            className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition-all"
          >
            <CheckCircle2 size={13} /> Approve
          </button>
        )}
        {r.status !== 'rejected' && (
          <button
            onClick={() => handleStatus(r, 'rejected')}
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all"
          >
            <XCircle size={13} /> Reject
          </button>
        )}
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Recruiters</h1>
        <p className="text-sm text-[#6B7280]">{filtered.length} companies</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search recruiters by company name..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Company</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Recruiter</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Email</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Website</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-[#6B7280] px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {filtered.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(r.college || r.name || '?')[0]}
                    </div>
                    <p className="text-sm font-medium text-[#111827]">{r.college || '—'}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#374151]">{r.name || '—'}</td>
                <td className="px-5 py-4 text-sm text-[#6B7280]">{r.email}</td>
                <td className="px-5 py-4 text-sm text-[#6B7280]">
                  {r.website ? (
                    <a href={/^https?:\/\//i.test(r.website) ? r.website : `https://${r.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      {r.website}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${recruiterStatusColors[r.status]}`}>
                    {recruiterStatusLabels[r.status]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">{renderActions(r)}</div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={24} className="text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">No recruiters found</p>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                {(r.college || r.name || '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111827] text-sm truncate">{r.college || '—'}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${recruiterStatusColors[r.status]}`}>
                  {recruiterStatusLabels[r.status]}
                </span>
              </div>
            </div>
            <div className="space-y-1.5 mb-3">
              <p className="text-xs text-[#6B7280] flex items-center gap-1.5"><User size={12} className="text-[#9CA3AF]" /> {r.name || '—'}</p>
              <p className="text-xs text-[#6B7280] flex items-center gap-1.5"><Mail size={12} className="text-[#9CA3AF]" /> {r.email}</p>
              {r.website && (
                <p className="text-xs text-[#6B7280] flex items-center gap-1.5">
                  <Globe size={12} className="text-[#9CA3AF]" />
                  <a href={/^https?:\/\//i.test(r.website) ? r.website : `https://${r.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium">{r.website}</a>
                </p>
              )}
            </div>
            <div className="flex gap-2">{renderActions(r)}</div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  )
}
