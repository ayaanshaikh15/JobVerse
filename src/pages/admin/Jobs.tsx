import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Briefcase, Trash2, MapPin } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ConfirmModal from '../../components/ConfirmModal'
import { fetchAllJobs, deleteJob } from '../../lib/adminApi'
import { formatDate } from '../../lib/utils'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let active = true
    fetchAllJobs()
      .then(data => { if (active) setJobs(data) })
      .catch(err => { if (active) toast.error(err?.message || 'Failed to load jobs') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingId(deleting.id)
    try {
      await deleteJob(deleting.id)
      setJobs(prev => prev.filter(j => j.id !== deleting.id))
      toast.success('Job deleted')
      setDeleting(null)
    } catch (err) {
      toast.error(err?.message || 'Failed to delete job')
    } finally {
      setDeletingId(null)
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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Jobs</h1>
        <p className="text-sm text-[#6B7280]">{jobs.length} job{jobs.length === 1 ? '' : 's'} posted</p>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Job Title</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Company</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Location</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Posted</th>
              <th className="text-right text-xs font-semibold text-[#6B7280] px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {jobs.map((job, i) => (
              <motion.tr key={job.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                      {(job.company || '?')[0]}
                    </div>
                    <p className="text-sm font-medium text-[#111827]">{job.title}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#374151]">{job.company}</td>
                <td className="px-5 py-4 text-sm text-[#6B7280]">{job.location}</td>
                <td className="px-5 py-4 text-sm text-[#6B7280]">{formatDate(job.created_at)}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => setDeleting(job)}
                    className="flex items-center gap-1.5 ml-auto text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase size={24} className="text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">No jobs posted yet</p>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {jobs.map((job, i) => (
          <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {(job.company || '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111827] text-sm truncate">{job.title}</p>
                <p className="text-xs text-[#6B7280]">{job.company}</p>
              </div>
              <button
                onClick={() => setDeleting(job)}
                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <p className="text-xs text-[#9CA3AF] flex items-center gap-1.5"><MapPin size={12} /> {job.location}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Posted {formatDate(job.created_at)}</p>
          </motion.div>
        ))}
      </div>

      <ConfirmModal
        open={!!deleting}
        title="Delete this job?"
        message={`This will permanently remove "${deleting?.title || 'this job'}" from the platform along with all of its applications. This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deletingId === deleting?.id}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
