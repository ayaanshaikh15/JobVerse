import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Download, Plus, X, FileText, AlertTriangle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useResume } from '../../hooks/useResume'
import { useAuth } from '../../hooks/useAuth'
import { generateResume, isGeminiConfigured } from '../../lib/gemini'
import { downloadResumePdf } from '../../lib/resumePdf'
import { fetchAiResume } from '../../lib/api'

const steps = [
  { id: 1, label: 'Personal Info', desc: 'Basic details' },
  { id: 2, label: 'Education', desc: 'Academic background' },
  { id: 3, label: 'Skills', desc: 'Technical & soft skills' },
  { id: 4, label: 'Projects', desc: 'Your work' },
  { id: 5, label: 'Experience', desc: 'Optional' },
  { id: 6, label: 'Achievements', desc: 'Awards & certs' },
  { id: 7, label: 'Preview', desc: 'Review & generate' },
]

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
            <button type="button" onClick={() => onRemove(i)} className="ml-0.5 hover:text-indigo-900"><X size={10} /></button>
          </span>
        ))}
      </div>
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={handle} placeholder={`${placeholder} (Enter to add)`} className="w-full text-sm text-[#111827] placeholder-[#9CA3AF] outline-none px-1.5 py-1" />
    </div>
  )
}

const defaultData = {
  personal: { name: '', email: '', phone: '', address: '', linkedin: '', github: '' },
  education: { college: '', degree: '', branch: '', cgpa: '', year: '' },
  skills: { technical: [], soft: [], languages: [], frameworks: [], databases: [] },
  projects: [{ name: '', description: '', technologies: [] }],
  experience: [],
  achievements: { certificates: [], awards: [] },
}

export default function AIResumeBuilder() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(defaultData)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [locked, setLocked] = useState(false)
  const [aiResume, setAiResume] = useState(null)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { saveGenerated } = useResume(user?.id)

  // The builder is one-time per account: if the user has EVER created an
  // AI-generated resume (not just the latest row), lock the builder.
  useEffect(() => {
    if (generated) return
    let active = true
    fetchAiResume(user?.id)
      .then(row => {
        if (active && row) {
          setLocked(true)
          setAiResume(row)
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [user?.id, generated])

  const updatePersonal = (field, val) => setData(d => ({ ...d, personal: { ...d.personal, [field]: val } }))
  const updateEducation = (field, val) => setData(d => ({ ...d, education: { ...d.education, [field]: val } }))
  const updateSkills = (field, tags) => setData(d => ({ ...d, skills: { ...d.skills, [field]: tags } }))

  const addProject = () => setData(d => ({ ...d, projects: [...d.projects, { name: '', description: '', technologies: [] }] }))
  const updateProject = (i, field, val) => setData(d => {
    const p = [...d.projects]
    p[i] = { ...p[i], [field]: val }
    return { ...d, projects: p }
  })
  const removeProject = (i) => setData(d => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }))

  const addExperience = () => setData(d => ({ ...d, experience: [...d.experience, { company: '', role: '', description: '', duration: '' }] }))
  const updateExp = (i, field, val) => setData(d => {
    const e = [...d.experience]
    e[i] = { ...e[i], [field]: val }
    return { ...d, experience: e }
  })

  // Local fallback used only when no Gemini API key is configured, so the
  // builder still works as a demo instead of erroring out.
  const fallbackResume = (d) => ({
    name: d.personal?.name || 'Aarav Mehta',
    email: d.personal?.email || '',
    phone: d.personal?.phone || '',
    linkedin: d.personal?.linkedin || '',
    github: d.personal?.github || '',
    summary: `Enthusiastic ${d.education?.branch || 'Computer Science'} student from ${d.education?.college || 'IIT Delhi'} with hands-on experience building real-world projects. Seeking an internship or full-time role to apply strong ${[
      ...(d.skills?.technical || []),
      ...(d.skills?.frameworks || []),
      ...(d.skills?.languages || []),
    ].join(', ') || 'technical'} skills in a fast-paced environment.`,
    education: [{
      school: d.education?.college || 'IIT Delhi',
      degree: `${d.education?.degree || 'B.Tech'} in ${d.education?.branch || 'Computer Science'}`,
      details: `CGPA ${d.education?.cgpa || '8.7'} · ${d.education?.year || '2025'}`,
    }],
    skills: [
      ...(d.skills?.technical || []),
      ...(d.skills?.frameworks || []),
      ...(d.skills?.databases || []),
      ...(d.skills?.languages || []),
      ...(d.skills?.soft || []),
    ],
    projects: (d.projects || []).filter(p => p.name).map(p => ({ name: p.name, description: p.description || '' })),
    experience: (d.experience || []).filter(e => e.company).map(e => ({
      title: e.role || 'Role',
      company: e.company,
      duration: e.duration || '',
      description: e.description || '',
    })),
    achievements: [...(d.achievements?.certificates || []), ...(d.achievements?.awards || [])],
  })

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      if (!isGeminiConfigured()) {
        await new Promise(r => setTimeout(r, 2000))
        setAiResult({ resume: fallbackResume(data), atsScore: 97, feedback: [] })
        setGenerated(true)
        toast.warning('Gemini API key not set — showing a demo result. Add VITE_GEMINI_API_KEY to .env for real AI generation.')
        return
      }
      const result = await generateResume(data)
      setAiResult(result)
      setGenerated(true)
      setSaved(false)
      try {
        // Persist immediately so the one-time builder locks after creation.
        await saveGenerated(result.resume)
        setSaved(true)
        toast.success(`AI Resume generated! ATS Score: ${result.atsScore}% 🎉`)
      } catch (saveErr) {
        toast.warning(`Resume generated (ATS ${result.atsScore}%) but could not be saved. Download it now to keep a copy.`)
      }
    } catch (err) {
      toast.error(err?.message || 'AI generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadResume = () => {
    const resume = aiResult?.resume ?? fallbackResume(data)
    downloadResumePdf(resume)
    toast.success('Resume downloaded as PDF!')
  }

  const handleSaveResume = async () => {
    if (!aiResult?.resume) return
    try {
      await saveGenerated(aiResult.resume)
      setSaved(true)
      toast.success('Resume saved to your account!')
    } catch (err) {
      toast.error(err?.message || 'Failed to save resume')
    }
  }

  // One-time builder — already created, show download instead of the form.
  if (locked) {
    const downloadLocked = () => {
      if (!aiResume?.content) return toast.error('No saved resume content found')
      try {
        downloadResumePdf(JSON.parse(aiResume.content))
        toast.success('Resume downloaded as PDF!')
      } catch {
        toast.error('Could not read your saved resume')
      }
    }
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            You&apos;ve already created your AI resume
          </h1>
          <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
            The AI Resume Builder is available only once per account. Download your resume from My Resume — you won&apos;t be able to create it again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={downloadLocked} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md">
              <Download size={16} /> Download Resume
            </button>
            <button onClick={() => navigate('/student/resume')} className="flex items-center justify-center gap-2 text-sm font-medium text-[#374151] bg-white border border-[#E2E8F0] px-6 py-3 rounded-xl hover:bg-[#F8FAFC] transition-all shadow-card">
              Go to My Resume
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const progress = ((step - 1) / (steps.length - 1)) * 100

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>AI Resume Builder</h1>
          <p className="text-sm text-[#6B7280]">Build an ATS-optimized resume in 7 simple steps</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5 mb-5">
          <div className="flex items-center gap-0 overflow-x-auto pb-1 scroll-hidden">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center shrink-0">
                <button onClick={() => s.id < step && setStep(s.id)} className={`flex flex-col items-center gap-1 ${s.id < step ? 'cursor-pointer' : 'cursor-default'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step === s.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : s.id < step ? 'bg-green-500 text-white' : 'bg-[#F1F5F9] text-[#9CA3AF]'}`}>
                    {s.id < step ? <CheckCircle2 size={14} /> : s.id}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${step === s.id ? 'text-indigo-600' : 'text-[#9CA3AF]'}`}>{s.label}</span>
                </button>
                {i < steps.length - 1 && <div className={`h-0.5 w-8 sm:w-12 mx-0.5 rounded-full transition-all ${s.id < step ? 'bg-green-400' : 'bg-[#E2E8F0]'}`} />}
              </div>
            ))}
          </div>
          <div className="h-1 bg-[#F1F5F9] rounded-full mt-3 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6 mb-5">
            <h2 className="font-bold text-[#111827] text-lg mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Step {step}: {steps[step - 1].label}</h2>
            <p className="text-xs text-[#6B7280] mb-6">{steps[step - 1].desc}</p>

            {step === 1 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { field: 'name', label: 'Full Name', placeholder: 'Aarav Mehta' },
                  { field: 'email', label: 'Email', placeholder: 'aarav@example.com' },
                  { field: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
                  { field: 'address', label: 'Address', placeholder: 'New Delhi, India' },
                  { field: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/aarav' },
                  { field: 'github', label: 'GitHub', placeholder: 'github.com/aarav' },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    <input className={inputCls} placeholder={placeholder} value={data.personal[field]} onChange={e => updatePersonal(field, e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { field: 'college', label: 'College / University', placeholder: 'IIT Delhi', full: true },
                  { field: 'degree', label: 'Degree', placeholder: 'B.Tech' },
                  { field: 'branch', label: 'Branch / Major', placeholder: 'Computer Science' },
                  { field: 'cgpa', label: 'CGPA', placeholder: '8.7' },
                  { field: 'year', label: 'Graduation Year', placeholder: '2025' },
                ].map(({ field, label, placeholder, full }) => (
                  <div key={field} className={full ? 'sm:col-span-2' : ''}>
                    <label className={labelCls}>{label}</label>
                    <input className={inputCls} placeholder={placeholder} value={data.education[field]} onChange={e => updateEducation(field, e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {[
                  { key: 'technical', label: 'Technical Skills', placeholder: 'React, TypeScript...' },
                  { key: 'frameworks', label: 'Frameworks', placeholder: 'Next.js, Django...' },
                  { key: 'databases', label: 'Databases', placeholder: 'PostgreSQL, Redis...' },
                  { key: 'soft', label: 'Soft Skills', placeholder: 'Leadership, Communication...' },
                  { key: 'languages', label: 'Programming Languages', placeholder: 'Python, Go...' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <TagInput
                      tags={data.skills[key]}
                      onAdd={v => updateSkills(key, [...data.skills[key], v])}
                      onRemove={i => updateSkills(key, data.skills[key].filter((_, idx) => idx !== i))}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                {data.projects.map((p, i) => (
                  <div key={i} className="border border-[#E2E8F0] rounded-2xl p-4 relative">
                    {data.projects.length > 1 && (
                      <button onClick={() => removeProject(i)} className="absolute top-3 right-3 p-1.5 rounded-xl hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-all">
                        <X size={14} />
                      </button>
                    )}
                    <p className="text-xs font-semibold text-[#6B7280] mb-3">Project {i + 1}</p>
                    <div className="space-y-3">
                      <div><label className={labelCls}>Project Name</label><input className={inputCls} placeholder="Portfolio Website" value={p.name} onChange={e => updateProject(i, 'name', e.target.value)} /></div>
                      <div><label className={labelCls}>Description</label><textarea className={`${inputCls} resize-none h-20`} placeholder="Brief description of what you built and the impact..." value={p.description} onChange={e => updateProject(i, 'description', e.target.value)} /></div>
                      <div>
                        <label className={labelCls}>Technologies Used</label>
                        <TagInput
                          tags={p.technologies}
                          onAdd={v => updateProject(i, 'technologies', [...p.technologies, v])}
                          onRemove={ti => updateProject(i, 'technologies', p.technologies.filter((_, idx) => idx !== ti))}
                          placeholder="React, Node.js..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addProject} className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                  <Plus size={16} /> Add another project
                </button>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <span className="text-amber-600">ℹ</span> This step is optional — skip if you have no work experience.
                </div>
                {data.experience.map((e, i) => (
                  <div key={i} className="border border-[#E2E8F0] rounded-2xl p-4">
                    <p className="text-xs font-semibold text-[#6B7280] mb-3">Experience {i + 1}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div><label className={labelCls}>Company</label><input className={inputCls} placeholder="Stripe" value={e.company} onChange={ev => updateExp(i, 'company', ev.target.value)} /></div>
                      <div><label className={labelCls}>Role</label><input className={inputCls} placeholder="Software Intern" value={e.role} onChange={ev => updateExp(i, 'role', ev.target.value)} /></div>
                      <div><label className={labelCls}>Duration</label><input className={inputCls} placeholder="Jun 2024 – Aug 2024" value={e.duration} onChange={ev => updateExp(i, 'duration', ev.target.value)} /></div>
                      <div className="sm:col-span-2"><label className={labelCls}>Description</label><textarea className={`${inputCls} resize-none h-20`} placeholder="Key responsibilities and achievements..." value={e.description} onChange={ev => updateExp(i, 'description', ev.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <button onClick={addExperience} className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700"><Plus size={16} /> Add experience</button>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Certificates</label>
                  <TagInput
                    tags={data.achievements.certificates}
                    onAdd={v => setData(d => ({ ...d, achievements: { ...d.achievements, certificates: [...d.achievements.certificates, v] } }))}
                    onRemove={i => setData(d => ({ ...d, achievements: { ...d.achievements, certificates: d.achievements.certificates.filter((_, idx) => idx !== i) } }))}
                    placeholder="AWS Certified, Google Cloud..."
                  />
                </div>
                <div>
                  <label className={labelCls}>Awards & Recognitions</label>
                  <TagInput
                    tags={data.achievements.awards}
                    onAdd={v => setData(d => ({ ...d, achievements: { ...d.achievements, awards: [...d.achievements.awards, v] } }))}
                    onRemove={i => setData(d => ({ ...d, achievements: { ...d.achievements, awards: d.achievements.awards.filter((_, idx) => idx !== i) } }))}
                    placeholder="Hackathon winner, Dean&apos;s list..."
                  />
                </div>
              </div>
            )}

            {step === 7 && (
              <div>
                {!generated && !generating && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                      <Sparkles size={28} className="text-white" />
                    </div>
                    <h3 className="font-bold text-[#111827] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Ready to generate your resume?</h3>
                    <p className="text-sm text-[#6B7280] mb-6 max-w-sm mx-auto">Our AI will analyze your information and create a perfectly formatted, ATS-optimized resume.</p>
                    <div className="flex flex-wrap gap-2 justify-center text-xs text-[#6B7280] mb-6">
                      <span className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5"><CheckCircle2 size={12} className="text-green-500" /> ATS Optimized</span>
                      <span className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5"><CheckCircle2 size={12} className="text-green-500" /> Professional Format</span>
                      <span className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5"><CheckCircle2 size={12} className="text-green-500" /> Keyword Matched</span>
                    </div>
                    <button onClick={handleGenerate} className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:shadow-lg transition-all">
                      <Sparkles size={16} /> Generate Resume
                    </button>
                  </div>
                )}

                {generating && (
                  <div className="text-center py-12">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="w-20 h-20 border-4 border-indigo-100 rounded-full" />
                      <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-violet-500 rounded-full animate-spin" />
                      <div className="absolute inset-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center">
                        <Sparkles size={18} className="text-white animate-pulse" />
                      </div>
                    </div>
                    <p className="font-semibold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>AI is creating your ATS-Friendly Resume</p>
                    <p className="text-sm text-[#6B7280]">Analyzing keywords, formatting, and optimizing...</p>
                    <div className="flex justify-center gap-1 mt-4">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <motion.div key={i} animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }} className="w-2 h-2 rounded-full bg-indigo-500" />
                      ))}
                    </div>
                  </div>
                )}

                {generated && aiResult && (
                  <div>
                    <div className="flex items-center gap-3 mb-5 p-4 bg-green-50 rounded-xl border border-green-100">
                      <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                      <div>
                        <p className="font-semibold text-green-800 text-sm">Resume generated successfully!</p>
                        <p className="text-xs text-green-600">ATS Score: {aiResult.atsScore}% · Ready to apply</p>
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                      <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        <span className="font-semibold">Download your resume now.</span> The AI Resume Builder is one-time only — once you leave this page you won&apos;t be able to generate it again.
                      </p>
                    </div>

                    {aiResult.feedback?.length > 0 && (
                      <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-xs font-semibold text-indigo-700 mb-2">AI Improvement Suggestions</p>
                        <ul className="space-y-1.5">
                          {aiResult.feedback.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-indigo-700">
                              <CheckCircle2 size={12} className="mt-0.5 shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="border border-[#E2E8F0] rounded-2xl p-6 bg-white mb-4">
                      <div className="border-b border-[#E2E8F0] pb-3 mb-3">
                        <h2 className="text-lg font-bold text-[#111827]" style={{ fontFamily: 'inherit' }}>{aiResult.resume.name || 'Aarav Mehta'}</h2>
                        <p className="text-sm text-[#6B7280]">{[aiResult.resume.email, aiResult.resume.phone].filter(Boolean).join(' · ')}</p>
                        <div className="flex gap-3 mt-1 text-indigo-600 text-[11px]">
                          {aiResult.resume.linkedin && <span>{aiResult.resume.linkedin}</span>}
                          {aiResult.resume.github && <span>{aiResult.resume.github}</span>}
                        </div>
                      </div>

                      {aiResult.resume.summary && (
                        <div className="mb-3">
                          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1">Summary</h3>
                          <p className="text-sm text-[#374151] leading-relaxed">{aiResult.resume.summary}</p>
                        </div>
                      )}

                      {aiResult.resume.education?.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1">Education</h3>
                          {aiResult.resume.education.map((edu, i) => (
                            <div key={i}>
                              <p className="text-sm font-semibold text-[#111827]">{edu.school}</p>
                              <p className="text-sm text-[#6B7280]">{edu.degree}{edu.details ? ` · ${edu.details}` : ''}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {aiResult.resume.skills?.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1">Skills</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {aiResult.resume.skills.map((skill, i) => (
                              <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiResult.resume.projects?.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1">Projects</h3>
                          {aiResult.resume.projects.map((p, i) => (
                            <div key={i} className="mb-1.5">
                              <p className="text-sm font-semibold text-[#111827]">{p.name}</p>
                              {p.description && <p className="text-sm text-[#6B7280]">{p.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {aiResult.resume.experience?.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1">Experience</h3>
                          {aiResult.resume.experience.map((exp, i) => (
                            <div key={i} className="mb-2">
                              <p className="text-sm font-semibold text-[#111827]">{exp.title} at {exp.company}</p>
                              {exp.duration && <p className="text-xs text-[#9CA3AF]">{exp.duration}</p>}
                              {exp.description && <p className="text-sm text-[#6B7280] mt-0.5 leading-relaxed">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {aiResult.resume.achievements?.length > 0 && (
                        <div>
                          <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1">Certifications & Awards</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {aiResult.resume.achievements.map((a, i) => (
                              <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={downloadResume} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                        <Download size={15} /> Download PDF
                      </button>
                      {saved ? (
                        <span className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-100 px-5 py-2.5 rounded-xl">
                          <CheckCircle2 size={15} /> Saved to your account
                        </span>
                      ) : (
                        <button onClick={handleSaveResume} className="flex items-center gap-2 text-sm font-medium text-[#374151] bg-[#F8FAFC] border border-[#E2E8F0] px-5 py-2.5 rounded-xl hover:bg-[#F1F5F9] transition-all">
                          Save Resume
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {!(step === 7 && generating) && (
          <div className="flex justify-between">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="flex items-center gap-2 text-sm font-medium text-[#374151] bg-white border border-[#E2E8F0] px-5 py-2.5 rounded-xl hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-card">
              <ChevronLeft size={16} /> Previous
            </button>
            {step < 7 && (
              <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
