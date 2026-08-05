import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Building2, Briefcase, Send, ChevronRight } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { fetchAdminStats } from '../../lib/adminApi'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchAdminStats()
      .then(data => { if (active) setStats(data) })
      .catch(err => { if (active) setError(err?.message || 'Failed to load stats') })
    return () => { active = false }
  }, [])

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents ?? null, icon: GraduationCap, to: '/admin/students', color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500 to-violet-600' },
    { label: 'Total Recruiters', value: stats?.totalRecruiters ?? null, icon: Building2, to: '/admin/recruiters', color: 'text-cyan-600', bg: 'bg-cyan-50', gradient: 'from-cyan-500 to-teal-600' },
    { label: 'Total Jobs', value: stats?.totalJobs ?? null, icon: Briefcase, to: '/admin/jobs', color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500 to-orange-600' },
    { label: 'Total Applications', value: stats?.totalApplications ?? null, icon: Send, to: '/admin/applications', color: 'text-green-600', bg: 'bg-green-50', gradient: 'from-green-500 to-emerald-600' },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Admin Dashboard</h1>
        <p className="text-sm text-[#6B7280]">Overview of the JobVerse platform</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, color, bg, to }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card"
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-bold text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {value === null ? <span className="h-7 w-10 skeleton inline-block align-middle" /> : value}
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-[#374151] mb-3">Manage</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ label, icon: Icon, to, gradient }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
          >
            <Link
              to={to}
              className="card-lift group bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                <Icon size={19} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{label.replace('Total ', '')}</p>
                <p className="text-xs text-[#6B7280]">Manage & view</p>
              </div>
              <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-indigo-400 shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  )
}
