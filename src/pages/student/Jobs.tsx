import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Search, MapPin, Filter, Bookmark, BookmarkCheck, ArrowUpRight, Clock } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useJobs, useSavedJobs } from '../../hooks/useJobs'
import { typeColors, formatDate } from '../../lib/utils'

const categories = ['All', 'Engineering', 'Design', 'Data Science', 'DevOps', 'Product']
const locations = ['All Locations', 'Remote', 'Bangalore, IN', 'San Francisco, CA', 'Hyderabad, IN']
const types = ['All Types', 'full-time', 'internship', 'part-time', 'contract']

function JobCard({ job, isSaved, onToggleSave }) {
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
          className={`p-2 rounded-xl transition-all ${isSaved ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-[#F8FAFC] text-[#9CA3AF]'}`}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[#6B7280]">
        <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
        <span className="flex items-center gap-1"><Clock size={12} />{formatDate(job.created_at)}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map(s => (
          <span key={s} className="text-[11px] bg-[#F8FAFC] text-[#6B7280] px-2 py-1 rounded-lg border border-[#E2E8F0]">{s}</span>
        ))}
        {job.skills.length > 4 && (
          <span className="text-[11px] text-[#9CA3AF] px-2 py-1">+{job.skills.length - 4}</span>
        )}
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

export default function Jobs() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All Locations')
  const [jobType, setJobType] = useState('All Types')
  const { jobs, loading } = useJobs()
  const { isSaved, toggle } = useSavedJobs()

  const filtered = jobs.filter(job => {
    const matchQuery = !query ||
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
    const matchCat = category === 'All' || job.category === category
    const matchLoc = location === 'All Locations' || job.location === location
    const matchType = jobType === 'All Types' || job.type === jobType
    return matchQuery && matchCat && matchLoc && matchType
  })

  const handleSave = (jobId) => {
    const wasSaved = isSaved(jobId)
    toggle(jobId)
    toast.success(wasSaved ? 'Job removed from saved' : 'Job saved!')
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Browse Jobs
        </h1>
        <p className="text-sm text-[#6B7280]">{filtered.length} opportunities available</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search job title, company, or skill..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="flex-1 sm:flex-none border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#374151] bg-[#F8FAFC] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            >
              {locations.map(l => <option key={l}>{l}</option>)}
            </select>
            <select
              value={jobType}
              onChange={e => setJobType(e.target.value)}
              className="flex-1 sm:flex-none border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#374151] bg-[#F8FAFC] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            >
              {types.map(t => <option key={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scroll-hidden">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-xl transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#F8FAFC] text-[#6B7280] border border-[#E2E8F0] hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-52 rounded-2xl skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-4">
              <Filter size={28} className="text-[#CBD5E1]" />
            </div>
            <p className="text-[#374151] font-semibold">No jobs found</p>
            <p className="text-sm text-[#6B7280] mt-1">Try adjusting your search or filters</p>
            <button
              onClick={() => { setQuery(''); setCategory('All'); setLocation('All Locations'); setJobType('All Types') }}
              className="mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={isSaved(job.id)}
                onToggleSave={() => handleSave(job.id)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
