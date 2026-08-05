import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Download, FileText, CheckCircle2, XCircle, Search, Filter, X, ExternalLink, Eye, CalendarClock, UserCheck } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useRecruiterApplications } from '../../hooks/useApplications'
import { useRecruiterJobs } from '../../hooks/useJobs'
import { useAuth } from '../../hooks/useAuth'
import { statusColors, statusLabels, formatDate } from '../../lib/utils'

export default function Applicants() {
  const { user } = useAuth()
  const { applications: applicants, loading, updateStatus, updateWithDetails } = useRecruiterApplications(user?.id)
  const { jobs: myJobs } = useRecruiterJobs(user?.id)
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [jobFilter, setJobFilter] = useState(searchParams.get('job') || 'all')
  const [viewingResume, setViewingResume] = useState(null)
  const [interviewApp, setInterviewApp] = useState(null)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewNote, setInterviewNote] = useState('')
  const [savingInterview, setSavingInterview] = useState(false)

  const filtered = applicants.filter(a => {
    const q = query.toLowerCase()
    const matchQuery = !q ||
      a.profile?.name?.toLowerCase().includes(q) ||
      (a.profile?.college?.toLowerCase().includes(q) || false)
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    const matchJob = jobFilter === 'all' || a.job_id === jobFilter
    return matchQuery && matchStatus && matchJob
  })

  const handleUpdateStatus = async (id, status, note = null) => {
    try {
      await updateWithDetails(id, { status, note })
      toast.success(`Applicant ${status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'moved to under review'}`)
    } catch (err) {
      toast.error(err?.message || 'Failed to update status')
    }
  }

  const openInterviewModal = (app) => {
    setInterviewApp(app)
    setInterviewDate(app.interview_at ? app.interview_at.slice(0, 16) : '')
    setInterviewNote(app.note || '')
  }

  const handleScheduleInterview = async () => {
    if (!interviewDate) return toast.error('Please pick a date and time for the interview')
    if (!interviewApp) return
    setSavingInterview(true)
    try {
      const iso = new Date(interviewDate).toISOString()
      await updateWithDetails(interviewApp.id, { status: 'interview', interview_at: iso, note: interviewNote })
      toast.success('Interview scheduled! The student has been notified.')
      setInterviewApp(null)
      setInterviewDate('')
      setInterviewNote('')
    } catch (err) {
      toast.error(err?.message || 'Failed to schedule interview')
    } finally {
      setSavingInterview(false)
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

  const renderResumeModal = () => {
    if (!viewingResume) return null
    const resume = viewingResume.resume
    const applicantName = viewingResume.profile?.name || 'Applicant'

    let content = null
    if (resume?.resume_url) {
      content = (
        <iframe
          src={resume.resume_url}
          className="w-full h-full border-0 rounded-xl"
          title={`${applicantName}'s Resume`}
        />
      )
    } else if (resume?.content) {
      try {
        const parsed = JSON.parse(resume.content)
        content = (
          <div className="p-6 space-y-4 overflow-auto h-full">
            <h3 className="text-lg font-bold text-[#111827]">{parsed.name || applicantName}</h3>
            {parsed.email && <p className="text-sm text-[#6B7280]">{parsed.email}</p>}
            {parsed.summary && (
              <div>
                <h4 className="text-sm font-semibold text-[#374151] mb-1">Summary</h4>
                <p className="text-sm text-[#6B7280]">{parsed.summary}</p>
              </div>
            )}
            {parsed.education?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#374151] mb-1">Education</h4>
                {parsed.education.map((edu, i) => (
                  <p key={i} className="text-sm text-[#6B7280]">{edu.school} — {edu.degree}</p>
                ))}
              </div>
            )}
            {parsed.experience?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#374151] mb-1">Experience</h4>
                {parsed.experience.map((exp, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-sm font-medium text-[#111827]">{exp.title} at {exp.company}</p>
                    <p className="text-xs text-[#9CA3AF]">{exp.duration}</p>
                    {exp.description && <p className="text-sm text-[#6B7280] mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}
            {parsed.skills?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#374151] mb-1">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.skills.map((skill, i) => (
                    <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      } catch {
        content = (
          <div className="p-6 text-center text-[#6B7280]">
            <p className="text-sm">Unable to parse resume content.</p>
          </div>
        )
      }
    } else {
      content = (
        <div className="p-6 text-center text-[#6B7280]">
          <FileText size={32} className="mx-auto mb-2 text-[#CBD5E1]" />
          <p className="text-sm">No resume available for this applicant.</p>
          <p className="text-xs mt-1">The applicant may not have uploaded a resume yet.</p>
        </div>
      )
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setViewingResume(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">{applicantName}'s Resume</h2>
                <p className="text-xs text-[#9CA3AF]">{resume?.file_name || 'No file name'}</p>
              </div>
              <div className="flex items-center gap-2">
                {resume?.resume_url && (
                  <a
                    href={resume.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all font-medium"
                  >
                    <ExternalLink size={12} /> Open
                  </a>
                )}
                <button
                  onClick={() => setViewingResume(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                >
                  <X size={16} className="text-[#6B7280]" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {content}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Applicants</h1>
        <p className="text-sm text-[#6B7280]">{filtered.length} candidates</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or college..." className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
        </div>
        <select value={jobFilter} onChange={e => setJobFilter(e.target.value)} className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#374151] bg-[#F8FAFC] focus:outline-none focus:border-indigo-400 cursor-pointer">
          <option value="all">All Jobs</option>
          {myJobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#374151] bg-[#F8FAFC] focus:outline-none focus:border-indigo-400 cursor-pointer">
          <option value="all">All Status</option>
          <option value="applied">Applied</option>
          <option value="reviewing">Reviewing</option>
          <option value="interview">Interview</option>
          <option value="attended">Interview Done</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Candidate</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Job Post</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">College</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Applied</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Resume</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {filtered.map((app, i) => (
              <motion.tr key={app.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-semibold shrink-0">{app.profile?.name?.[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-[#111827]">{app.profile?.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{app.profile?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#111827] truncate max-w-[160px]">{app.job?.title || '—'}</p>
                  <p className="text-xs text-[#9CA3AF]">{app.job?.location || ''}</p>
                </td>
                <td className="px-5 py-4 text-sm text-[#374151]">{app.profile?.college || '—'}</td>
                <td className="px-5 py-4 text-sm text-[#6B7280]">{formatDate(app.created_at)}</td>
                <td className="px-5 py-4">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[app.status]}`}>{statusLabels[app.status]}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setViewingResume(app)}
                      disabled={!app.resume}
                      className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    ><FileText size={12} /> View</button>
                    {app.resume?.resume_url && (
                      <a
                        href={app.resume.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#374151] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] px-2.5 py-1.5 rounded-lg transition-all"
                      ><Download size={12} /></a>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {app.status === 'applied' && (
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => handleUpdateStatus(app.id, 'reviewing')} className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-all font-medium"><Eye size={12} /> Review</button>
                      <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all font-medium"><XCircle size={12} /> Reject</button>
                    </div>
                  )}
                  {app.status === 'reviewing' && (
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => openInterviewModal(app)} className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-all font-medium"><CalendarClock size={12} /> Schedule</button>
                      <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all font-medium"><XCircle size={12} /> Reject</button>
                    </div>
                  )}
                  {app.status === 'interview' && (
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => handleUpdateStatus(app.id, 'attended')} className="flex items-center gap-1 text-xs text-teal-600 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-all font-medium"><UserCheck size={12} /> Mark Attended</button>
                      <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all font-medium"><XCircle size={12} /> Reject</button>
                    </div>
                  )}
                  {app.status === 'attended' && (
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => handleUpdateStatus(app.id, 'accepted')} className="flex items-center gap-1 text-xs text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-all font-medium"><CheckCircle2 size={12} /> Accept</button>
                      <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all font-medium"><XCircle size={12} /> Reject</button>
                    </div>
                  )}
                  {(app.status === 'accepted' || app.status === 'rejected') && (
                    <span className="text-xs font-medium text-[#9CA3AF]">{statusLabels[app.status]}</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Filter size={24} className="text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">No applicants match your filters</p>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((app, i) => (
          <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">{app.profile?.name?.[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111827] text-sm truncate">{app.profile?.name}</p>
                <p className="text-xs text-[#6B7280]">{app.profile?.college}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[app.status]}`}>{statusLabels[app.status]}</span>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-1">Applied for <span className="font-medium text-[#374151]">{app.job?.title || '—'}</span></p>
            <p className="text-xs text-[#9CA3AF] mb-3">{formatDate(app.created_at)}</p>
            {app.resume && (
              <button
                onClick={() => setViewingResume(app)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 rounded-xl mb-3 transition-all"
              ><FileText size={13} /> View Resume</button>
            )}
            {app.status === 'applied' && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleUpdateStatus(app.id, 'reviewing')} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 py-2 rounded-xl"><Eye size={13} /> Review</button>
                <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 py-2 rounded-xl"><XCircle size={13} /> Reject</button>
              </div>
            )}
            {app.status === 'reviewing' && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => openInterviewModal(app)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 py-2 rounded-xl"><CalendarClock size={13} /> Schedule</button>
                <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 py-2 rounded-xl"><XCircle size={13} /> Reject</button>
              </div>
            )}
            {app.status === 'interview' && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleUpdateStatus(app.id, 'attended')} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50 py-2 rounded-xl"><UserCheck size={13} /> Mark Attended</button>
                <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 py-2 rounded-xl"><XCircle size={13} /> Reject</button>
              </div>
            )}
            {app.status === 'attended' && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleUpdateStatus(app.id, 'accepted')} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 py-2 rounded-xl"><CheckCircle2 size={13} /> Accept</button>
                <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 py-2 rounded-xl"><XCircle size={13} /> Reject</button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {renderResumeModal()}

      <AnimatePresence>
        {interviewApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setInterviewApp(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md flex flex-col overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">Schedule Interview</h2>
                  <p className="text-xs text-[#9CA3AF]">{interviewApp.profile?.name} — {interviewApp.job?.title}</p>
                </div>
                <button
                  onClick={() => setInterviewApp(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                >
                  <X size={16} className="text-[#6B7280]" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Interview Date & Time</label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    className="w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Message to Student</label>
                  <textarea
                    value={interviewNote}
                    onChange={e => setInterviewNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. Please join the Google Meet link below. Let us know if you need to reschedule."
                    className="w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white resize-none"
                  />
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => setInterviewApp(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#6B7280] hover:bg-[#F8FAFC] transition-all"
                >Cancel</button>
                <button
                  onClick={handleScheduleInterview}
                  disabled={savingInterview || !interviewDate}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {savingInterview ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CalendarClock size={14} /> Schedule</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
