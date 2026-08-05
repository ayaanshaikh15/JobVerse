import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, MapPin, DollarSign, Clock, CheckCircle2, Gift, Briefcase, X, Upload, Sparkles } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { fetchJob, fetchApplicationForJob, applyToJob } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { useResume } from '../../hooks/useResume'
import { typeColors, formatDate } from '../../lib/utils'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { resume, loading: resumeLoading } = useResume(user?.id)

  const [job, setJob] = useState(null)
  const [jobLoading, setJobLoading] = useState(true)
  const [applied, setApplied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await fetchJob(id)
        if (!active) return
        setJob(data)
        if (data && user) {
          const existing = await fetchApplicationForJob(user.id, data.id)
          if (active && existing) setApplied(true)
        }
      } catch (err) {
        console.error('Failed to load job:', err.message)
      } finally {
        if (active) setJobLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id, user])

  const handleApply = async () => {
    if (applied || !job) return
    if (!resume) {
      setShowModal(true)
      return
    }
    setApplying(true)
    try {
      await applyToJob(user.id, job.id, resume.id)
      setApplied(true)
      toast.success('Application submitted! 🎉')
    } catch (err) {
      toast.error(err?.message || 'Failed to apply. Try again.')
    } finally {
      setApplying(false)
    }
  }

  if (jobLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="h-8 w-24 skeleton" />
          <div className="h-40 rounded-3xl skeleton" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-5">
              <div className="h-32 rounded-2xl skeleton" />
              <div className="h-32 rounded-2xl skeleton" />
            </div>
            <div className="h-64 rounded-2xl skeleton" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-[#374151] font-semibold">Job not found</p>
          <Link to="/student/jobs" className="text-sm text-indigo-600 mt-2 block">← Back to jobs</Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> Back to jobs
        </button>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shrink-0">
                {job.company?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>{job.title}</h1>
                <p className="text-[#6B7280] font-medium mt-0.5">{job.company}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-[#6B7280]">
                  <span className="flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>
                  <span className="flex items-center gap-1.5"><DollarSign size={14} />{job.salary}</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} />Posted {formatDate(job.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {job.type && (
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${typeColors[job.type]}`}>
                  {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                </span>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[#F1F5F9]">
            {job.skills?.map(s => (
              <span key={s} className="text-xs bg-[#F8FAFC] text-[#374151] border border-[#E2E8F0] px-3 py-1.5 rounded-xl">{s}</span>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-5">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6"
            >
              <h2 className="font-semibold text-[#111827] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>About the Role</h2>
              <p className="text-sm text-[#374151] leading-relaxed">{job.description}</p>
            </motion.div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6"
              >
                <h2 className="font-semibold text-[#111827] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Requirements</h2>
                <ul className="space-y-2.5">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#374151]">
                      <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6"
              >
                <h2 className="font-semibold text-[#111827] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map(b => (
                    <span key={b} className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-xl">
                      <Gift size={12} /> {b}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sticky sidebar */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5 sticky top-20"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center text-indigo-600 font-bold">
                  {job.company?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#111827] text-sm">{job.company}</p>
                  <p className="text-xs text-[#6B7280]">{job.location}</p>
                </div>
              </div>

              <div className="space-y-2.5 mb-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280] text-xs">Salary</span>
                  <span className="font-semibold text-[#111827] text-xs">{job.salary}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280] text-xs">Type</span>
                  <span className="font-semibold text-[#111827] text-xs capitalize">{job.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280] text-xs">Category</span>
                  <span className="font-semibold text-[#111827] text-xs">{job.category}</span>
                </div>
              </div>

              <button
                onClick={handleApply}
                disabled={applied || applying}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  applied
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg disabled:opacity-60'
                }`}
              >
                {applied ? (
                  <><CheckCircle2 size={16} /> Applied!</>
                ) : applying ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Briefcase size={16} /> Apply Now</>
                )}
              </button>

              {!resume && !applied && !resumeLoading && (
                <p className="text-xs text-[#9CA3AF] text-center mt-2">
                  No resume on file. We&apos;ll ask you to upload or generate one.
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* No resume modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>Add your resume</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl hover:bg-[#F8FAFC] text-[#9CA3AF]">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-[#6B7280] mb-5">You need a resume to apply. Choose how to proceed:</p>

              <div className="space-y-3">
                <Link
                  to="/student/resume"
                  className="flex items-center gap-3 bg-[#F8FAFC] hover:bg-indigo-50 border border-[#E2E8F0] hover:border-indigo-200 rounded-2xl p-4 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Upload size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">Upload Resume</p>
                    <p className="text-xs text-[#6B7280]">PDF file, up to 5MB</p>
                  </div>
                </Link>

                <Link
                  to="/student/resume"
                  className="flex items-center gap-3 bg-gradient-to-br from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 border border-indigo-200 rounded-2xl p-4 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">Generate AI Resume</p>
                    <p className="text-xs text-[#6B7280]">ATS-optimized in minutes</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
