import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Upload, FileText, Trash2, Sparkles, Eye, Download, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useResume } from '../../hooks/useResume'
import { useAuth } from '../../hooks/useAuth'

export default function Resume() {
  const { user } = useAuth()
  const { resume, loading, upload, remove } = useResume(user?.id)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are allowed'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    setUploading(true)
    try {
      await upload(file)
      toast.success('Resume uploaded successfully! 🎉')
    } catch (err) {
      toast.error(err?.message || 'Upload failed. Make sure the "resumes" bucket exists.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDelete = async () => {
    try {
      await remove()
      toast.success('Resume deleted')
    } catch (err) {
      toast.error(err?.message || 'Failed to delete resume')
    }
  }

  const downloadGenerated = () => {
    if (!resume?.content) return toast.error('No resume content found')
    const blob = new Blob([resume.content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = resume.file_name || 'resume.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>My Resume</h1>
          <p className="text-sm text-[#6B7280]">Upload your resume or let AI build one for you</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 mb-6 overflow-hidden">
          <div className="absolute right-4 top-4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute right-12 bottom-2 w-16 h-16 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-indigo-200" />
              <span className="text-xs font-semibold text-indigo-200">AI-Powered</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Build an ATS-Friendly Resume</h2>
            <p className="text-indigo-100 text-sm mb-4 max-w-sm">Our AI analyzes thousands of job descriptions to create a tailored, optimized resume that passes every ATS filter.</p>
            <Link to="/student/resume/builder" className="inline-flex items-center gap-2 !bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:shadow-lg transition-all">
              <Sparkles size={15} /> Generate AI Resume
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6">
          <h2 className="font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Upload Resume</h2>

          <AnimatePresence mode="wait">
            {resume ? (
              <motion.div key="uploaded" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="border-2 border-green-200 bg-green-50/50 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <FileText size={22} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#111827] truncate">{resume.file_name || 'AI-generated resume'}</p>
                    <p className="text-xs text-[#6B7280]">{resume.resume_type === 'ai_generated' ? 'AI Generated · ATS optimized' : 'PDF · Uploaded'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Ready for applications</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {resume.resume_url ? (
                    <>
                      <a href={resume.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-all"><Eye size={13} /> Preview</a>
                      <a href={resume.resume_url} download className="flex items-center gap-1.5 text-xs font-medium text-[#374151] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-2 rounded-xl transition-all"><Download size={13} /> Download</a>
                    </>
                  ) : (
                    <button onClick={downloadGenerated} className="flex items-center gap-1.5 text-xs font-medium text-[#374151] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-2 rounded-xl transition-all"><Download size={13} /> Download</button>
                  )}
                  <button onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 text-xs font-medium text-[#374151] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-2 rounded-xl transition-all"><Upload size={13} /> Replace</button>
                  <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all ml-auto"><Trash2 size={13} /> Delete</button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-[#CBD5E1] hover:border-indigo-300 hover:bg-[#F8FAFC]'
                }`}
              >
                {uploading || loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm text-[#6B7280]">{loading ? 'Loading your resume...' : 'Uploading your resume...'}</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                      <Upload size={24} className={isDragging ? 'text-indigo-600' : 'text-[#9CA3AF]'} />
                    </div>
                    <p className="font-semibold text-[#374151] mb-1">Drag & drop your resume here</p>
                    <p className="text-sm text-[#9CA3AF] mb-3">or click to browse</p>
                    <span className="text-xs text-[#CBD5E1]">PDF only · Max 5MB</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
