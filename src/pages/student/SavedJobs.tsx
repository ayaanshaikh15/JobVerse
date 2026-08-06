import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { MapPin, Bookmark, BookmarkCheck, ArrowUpRight, Clock, BookmarkX } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useJobs, useSavedJobs } from '../../hooks/useJobs'
import { useAuth } from '../../hooks/useAuth'
import { typeColors, formatDate } from '../../lib/utils'

function SavedJobCard({ job, onToggleSave }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="card-lift bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-600 font-bold text-base shrink-0">
            {job.company[0]}
          </div>
          <div>
            <h3 className="font-semibold text-[#111827] text-sm leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.title}</h3>
            <p className="text-xs text-[#6B7280]">{job.company}</p>
          </div>
        </div>
        <button
          onClick={onToggleSave}
          className="p-2 rounded-xl transition-all bg-indigo-50 text-indigo-600"
          title="Remove from saved"
        >
          <BookmarkCheck size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[#6B7280]">
        <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
        <span className="flex items-center gap-1"><Clock size={12} />Posted {formatDate(job.created_at)}</span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-indigo-600">{job.salary}</span>
          {job.type && (
            <span className={`text-[11px] px-2 py-0.5 rounded-lg font-medium ${typeColors[job.type]}`}>
              {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
            </span>
          )}
        </div>
        <Link
          to={`/student/jobs/${job.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
        >
          View <ArrowUpRight size={13} />
        </Link>
      </div>
    </motion.div>
  )
}

export default function SavedJobs() {
  const { user } = useAuth()
  const { jobs, loading: jobsLoading } = useJobs()
  const { saved, toggle, loading: savedLoading } = useSavedJobs(user?.id)

  const loading = jobsLoading || savedLoading
  const savedJobs = jobs.filter(job => saved.includes(job.id))

  const handleRemove = async (jobId) => {
    try {
      await toggle(jobId)
      toast.success('Job removed from saved')
    } catch (err) {
      toast.error(err?.message || 'Could not remove saved job')
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Saved Jobs
        </h1>
        <p className="text-sm text-[#6B7280]">{savedJobs.length} saved {savedJobs.length === 1 ? 'job' : 'jobs'}</p>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-52 rounded-2xl skeleton" />
            ))}
          </div>
        ) : savedJobs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-4">
              <BookmarkX size={28} className="text-[#CBD5E1]" />
            </div>
            <p className="text-[#374151] font-semibold">No saved jobs yet</p>
            <p className="text-sm text-[#6B7280] mt-1">Bookmark jobs you&apos;re interested in to find them here</p>
            <Link
              to="/student/jobs"
              className="mt-4 inline-flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              <Bookmark size={14} /> Browse jobs
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {savedJobs.map(job => (
              <SavedJobCard
                key={job.id}
                job={job}
                onToggleSave={() => handleRemove(job.id)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
