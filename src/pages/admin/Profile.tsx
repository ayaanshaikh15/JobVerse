import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { LogOut, Mail, ShieldCheck, Calendar, User } from 'lucide-react'
import SignOutModal from '../../components/SignOutModal'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../hooks/useAuth'
import { getInitials, formatDate } from '../../lib/utils'

export default function AdminProfile() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = async () => {
    setShowLogout(false)
    try {
      await logout()
      toast.success('Signed out successfully')
      navigate('/')
    } catch (err) {
      toast.error(err?.message || 'Failed to sign out')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Profile</h1>
          <p className="text-sm text-[#6B7280]">Admin account information</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 mb-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile ? getInitials(profile.name) : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-[#111827] truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{profile?.name}</h2>
              <p className="text-sm text-[#6B7280] truncate">{profile?.email}</p>
              <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-medium mt-1">
                <ShieldCheck size={11} /> Admin
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6 mb-5">
          <h3 className="font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Account Information</h3>
          <div className="space-y-3">
            {[
              { icon: Mail, label: 'Email', value: profile?.email },
              { icon: User, label: 'Role', value: 'Administrator' },
              { icon: Calendar, label: 'Member since', value: formatDate(profile?.created_at) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
                <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] flex items-center justify-center">
                  <Icon size={14} className="text-[#6B7280]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">{label}</p>
                  <p className="text-sm text-[#111827]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <button onClick={() => setShowLogout(true)} className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-5 py-3 rounded-xl transition-all w-full justify-center">
          <LogOut size={16} /> Sign out
        </button>

        <SignOutModal open={showLogout} onClose={() => setShowLogout(false)} onConfirm={handleLogout} />
      </div>
    </DashboardLayout>
  )
}
