import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, X, Briefcase, Clock, XCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useRecruiterJobs } from '../../hooks/useJobs'
import { useAuth } from '../../hooks/useAuth'
import { fetchJobForRecruiter } from '../../lib/api'

const inputCls = 'w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white'
const labelCls = 'block text-xs font-semibold text-[#374151] mb-1.5'

function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [val, setVal] = useState('')
  const handle = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && val.trim()) {
      e.preventDefault()
      onAdd(val.trim())
      setVal('')
    }
  }
  return (
    <div className="border border-[#E2E8F0] rounded-xl p-2 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
      <div className="flex flex-wrap gap-1.5 mb-1">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
            {t}
            <button type="button" onClick={() => onRemove(i)}><X size={10} /></button>
          </span>
        ))}
      </div>
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={handle} placeholder={`${placeholder} (Enter to add)`} className="w-full text-sm outline-none px-1.5 py-1 text-[#111827] placeholder-[#9CA3AF]" />
    </div>
  )
}

export default function PostJob() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, profile } = useAuth()
  const { addJob, updateJob } = useRecruiterJobs(user?.id)
  const [loading, setLoading] = useState(false)
  const [jobLoading, setJobLoading] = useState(!!id)
  const [form, setForm] = useState({
    title: '', company: '', location: '', salary: '', description: '',
    type: 'full-time',
    category: 'Engineering',
  })
  const [skills, setSkills] = useState([])
  const [requirements, setRequirements] = useState([])
  const [benefits, setBenefits] = useState([])

  const isEdit = !!id

  useEffect(() => {
    if (!id) return
    let active = true
    const load = async () => {
      try {
        const data = await fetchJobForRecruiter(id, user?.id)
        if (!active) return
        if (!data) {
          toast.error('Job not found or you do not have permission to edit it')
          navigate('/recruiter/jobs')
          return
        }
        setForm({
          title: data.title || '',
          company: data.company || '',
          location: data.location || '',
          salary: data.salary || '',
          description: data.description || '',
          type: data.type || 'full-time',
          category: data.category || 'Engineering',
        })
        setSkills(data.skills || [])
        setRequirements(data.requirements || [])
        setBenefits(data.benefits || [])
      } catch (err) {
        toast.error(err?.message || 'Failed to load job')
        navigate('/recruiter/jobs')
      } finally {
        if (active) setJobLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id, navigate, user?.id])

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.company || !form.location || !form.salary || !form.description) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await updateJob(id, { ...form, skills, requirements, benefits })
        toast.success('Job updated successfully! 🎉')
      } else {
        await addJob({ ...form, skills, requirements, benefits, recruiter_id: user?.id })
        toast.success('Job posted successfully! 🎉')
      }
      navigate('/recruiter/jobs')
    } catch (err) {
      toast.error(err?.message || 'Failed to save job. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (profile && profile.status !== 'approved') {
    const rejected = profile.status === 'rejected'
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-20">
          <div className={`w-20 h-20 rounded-3xl border flex items-center justify-center mx-auto mb-4 ${rejected ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
            {rejected ? <XCircle size={30} className="text-red-500" /> : <Clock size={30} className="text-amber-500" />}
          </div>
          <h1 className="text-xl font-bold text-[#111827] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {rejected ? 'Company registration rejected' : 'Account pending approval'}
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            {rejected
              ? 'Your company registration was rejected by the admin. Contact support if you believe this is a mistake.'
              : 'Your company is awaiting admin approval. You will be able to post jobs as soon as an admin approves your recruiter account.'}
          </p>
        </div>
      </DashboardLayout>
    )
  }

  if (jobLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="h-7 w-32 skeleton mb-6" />
          <div className="h-56 rounded-2xl skeleton" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{isEdit ? 'Edit Job' : 'Post a Job'}</h1>
          <p className="text-sm text-[#6B7280]">{isEdit ? 'Update the details of this listing' : 'Fill in the details to attract the right candidates'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6 mb-5">
            <h2 className="font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Job Title *</label>
                <input className={inputCls} placeholder="e.g. Senior Frontend Engineer" value={form.title} onChange={e => update('title', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Company Name *</label>
                <input className={inputCls} placeholder="e.g. Stripe" value={form.company} onChange={e => update('company', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Location *</label>
                <input className={inputCls} placeholder="e.g. Bangalore, IN or Remote" value={form.location} onChange={e => update('location', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Salary / Stipend *</label>
                <input className={inputCls} placeholder="e.g. ₹18L–₹28L or $120k" value={form.salary} onChange={e => update('salary', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Job Type</label>
                <select className={inputCls} value={form.type} onChange={e => update('type', e.target.value)}>
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={form.category} onChange={e => update('category', e.target.value)}>
                  {['Engineering', 'Design', 'Data Science', 'DevOps', 'Product', 'Marketing'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6 mb-5">
            <h2 className="font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Job Description *</h2>
            <textarea className={`${inputCls} resize-none h-32`} placeholder="Describe the role, team, and what the candidate will be working on..." value={form.description} onChange={e => update('description', e.target.value)} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6 mb-5 space-y-5">
            <h2 className="font-semibold text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>Skills & Requirements</h2>
            <div>
              <label className={labelCls}>Required Skills</label>
              <TagInput tags={skills} onAdd={v => setSkills(s => [...s, v])} onRemove={i => setSkills(s => s.filter((_, idx) => idx !== i))} placeholder="React, TypeScript..." />
            </div>
            <div>
              <label className={labelCls}>Requirements</label>
              <TagInput tags={requirements} onAdd={v => setRequirements(s => [...s, v])} onRemove={i => setRequirements(s => s.filter((_, idx) => idx !== i))} placeholder="3+ years experience..." />
            </div>
            <div>
              <label className={labelCls}>Benefits & Perks</label>
              <TagInput tags={benefits} onAdd={v => setBenefits(s => [...s, v])} onRemove={i => setBenefits(s => s.filter((_, idx) => idx !== i))} placeholder="Remote work, Health insurance..." />
            </div>
          </motion.div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-md hover:shadow-lg">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Briefcase size={16} /> {isEdit ? 'Update Job' : 'Post Job'}</>}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
