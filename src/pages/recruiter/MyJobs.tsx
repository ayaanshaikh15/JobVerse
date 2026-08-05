import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Edit2, Trash2, Users, PlusCircle, MapPin, DollarSign } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useRecruiterJobs } from '../../hooks/useJobs'
import { useRecruiterApplications } from '../../hooks/useApplications'
import { useAuth } from '../../hooks/useAuth'
import { typeColors, formatDate } from '../../lib/utils'

export default function MyJobs() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { jobs, loading, deleteJob } = useRecruiterJobs(user?.id)
  const { applications: applicants } = useRecruiterApplications(user?.id)

  const applicantCount = (jobId) => applicants.filter(a => a.job_id === jobId).length

  const handleDelete = async (id) => {
    try {
      await deleteJob(id)
      toast.success('Job deleted')
    } catch (err) {
      toast.error(err?.message || 'Failed to delete job')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-24 skeleton" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-24 rounded-2xl skeleton" />
          ))}
        </div>
      </DashboardLayout>
    )
  }

  if (jobs.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-[#CBD5E1]" />
          </div>
          <p className="font-semibold text-[#374151]">No jobs posted yet</p>
          <p className="text-sm text-[#6B7280] mt-1">Post your first job to start receiving applications</p>
          <Link to="/recruiter/post-job" className="inline-flex items-center gap-1.5 mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700">
            <PlusCircle size={14} /> Post a Job
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>My Jobs</h1>
          <p className="text-sm text-[#6B7280]">{jobs.length} active listings</p>
        </div>
        <Link to="/recruiter/post-job" className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md">
          <PlusCircle size={15} /> Post Job
        </Link>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-600 font-bold text-base shrink-0">
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.title}</h3>
                      <p className="text-xs text-[#6B7280] mt-0.5">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {job.type && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-lg font-medium ${typeColors[job.type]}`}>
                          {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-[#6B7280] mt-2">
                    <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign size={11} />{job.salary}</span>
                    <span>Posted {formatDate(job.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {job.skills.slice(0, 4).map(s => (
                      <span key={s} className="text-[11px] bg-[#F8FAFC] text-[#6B7280] px-2 py-0.5 rounded-lg border border-[#E2E8F0]">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#F1F5F9]">
                <div className="flex-1 flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <Users size={13} /><span>{applicantCount(job.id)} applicants</span>
                </div>
                <Link to={`/recruiter/applicants?job=${job.id}`} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all">
                  <Users size={13} /> View Applicants
                </Link>
                <button onClick={() => navigate(`/recruiter/edit-job/${job.id}`)} className="flex items-center gap-1.5 text-xs font-medium text-[#374151] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] px-3 py-1.5 rounded-xl transition-all">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(job.id)} className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
