import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Search, Trash2, GraduationCap, Users } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ConfirmModal from '../../components/ConfirmModal'
import { fetchAllStudents, deleteStudent } from '../../lib/adminApi'
import { getInitials, formatDate } from '../../lib/utils'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let active = true
    fetchAllStudents()
      .then(data => { if (active) setStudents(data) })
      .catch(err => { if (active) toast.error(err?.message || 'Failed to load students') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = students.filter(s => {
    const q = query.toLowerCase()
    return !q ||
      s.name?.toLowerCase().includes(q) ||
      (s.email?.toLowerCase().includes(q) || false)
  })

  const handleDelete = async () => {
    if (!deleting) return
    setDeletingId(deleting.id)
    try {
      await deleteStudent(deleting.id)
      setStudents(prev => prev.filter(s => s.id !== deleting.id))
      toast.success('Student deleted')
      setDeleting(null)
    } catch (err) {
      toast.error(err?.message || 'Failed to delete student')
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
        <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Students</h1>
        <p className="text-sm text-[#6B7280]">{filtered.length} student{filtered.length === 1 ? '' : 's'}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search students by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Email</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">College</th>
              <th className="text-left text-xs font-semibold text-[#6B7280] px-5 py-3">Joined</th>
              <th className="text-right text-xs font-semibold text-[#6B7280] px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {filtered.map((s, i) => (
              <motion.tr key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {s.avatar ? (
                      <img src={s.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {getInitials(s.name || '?')}
                      </div>
                    )}
                    <p className="text-sm font-medium text-[#111827]">{s.name || '—'}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#6B7280]">{s.email}</td>
                <td className="px-5 py-4 text-sm text-[#374151]">{s.college || '—'}</td>
                <td className="px-5 py-4 text-sm text-[#6B7280]">{formatDate(s.created_at)}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => setDeleting(s)}
                    className="flex items-center gap-1.5 ml-auto text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap size={24} className="text-[#CBD5E1] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">No students found</p>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-4">
            <div className="flex items-center gap-3 mb-3">
              {s.avatar ? (
                <img src={s.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white text-sm font-bold">
                  {getInitials(s.name || '?')}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#111827] text-sm truncate">{s.name}</p>
                <p className="text-xs text-[#6B7280] truncate">{s.email}</p>
              </div>
              <button
                onClick={() => setDeleting(s)}
                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <p className="text-xs text-[#9CA3AF]"><span className="text-[#374151]">College:</span> {s.college || '—'}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Joined {formatDate(s.created_at)}</p>
          </motion.div>
        ))}
      </div>

      <ConfirmModal
        open={!!deleting}
        title="Delete this student?"
        message={`This will permanently remove ${deleting?.name || 'this student'} and all of their data from the platform. This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deletingId === deleting?.id}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
