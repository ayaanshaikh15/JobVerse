import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Edit2, LogOut, Building2, Mail, Phone, Camera, Sparkles } from 'lucide-react'
import SignOutModal from '../../components/SignOutModal'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../hooks/useAuth'
import { getInitials } from '../../lib/utils'

export default function RecruiterProfile() {
  const { profile, logout, updateProfile, isProfileComplete } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [form, setForm] = useState({ name: profile?.name || '', phone: profile?.phone || '' })
  const inputCls = 'w-full border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white'

  const incomplete = profile ? !isProfileComplete(profile) : false

  useEffect(() => {
    if (!profile) return
    if (incomplete) setEditing(true)
    setForm(f => ({
      name: f.name || profile.name || '',
      phone: f.phone || profile.phone || '',
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const handleSave = async () => {
    try {
      const updated = await updateProfile(form)
      if (incomplete && isProfileComplete(updated)) {
        toast.success('Profile complete! Taking you to your dashboard 🎉')
        navigate('/recruiter/dashboard')
        return
      }
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile')
    }
  }

  const handleLogout = async () => {
    setShowLogout(false)
    try {
      await logout()
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
          <p className="text-sm text-[#6B7280]">Manage your recruiter account</p>
        </div>

        {incomplete && (
          <div className="mb-5 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-cyan-700">Complete your profile</p>
              <p className="text-xs text-cyan-600">Add your details below to unlock your dashboard.</p>
            </div>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-card p-6 mb-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile ? getInitials(profile.name) : 'R'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#6B7280] shadow-sm">
                <Camera size={13} />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>{profile?.name}</h2>
              <p className="text-sm text-[#6B7280]">{profile?.email}</p>
              <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-100 px-2.5 py-0.5 rounded-full font-medium mt-1 inline-block">Recruiter</span>
            </div>
            <button onClick={() => setEditing(!editing)} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-300 text-[#6B7280] hover:text-indigo-600 transition-all">
              <Edit2 size={16} />
            </button>
          </div>
        </motion.div>

        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-indigo-200 shadow-card p-6 mb-5">
            <h3 className="font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Edit Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Full Name</label>
                <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Phone</label>
                <input className={inputCls} placeholder="+1 415 555 0123" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-indigo-700 transition-all">Save</button>
              <button onClick={() => setEditing(false)} className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#374151] text-sm py-2.5 rounded-xl hover:bg-[#F1F5F9] transition-all">Cancel</button>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6 mb-5">
          <h3 className="font-semibold text-[#111827] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Contact Information</h3>
          <div className="space-y-3">
            {[
              { icon: Mail, label: 'Email', value: profile?.email },
              { icon: Phone, label: 'Phone', value: profile?.phone || 'Not added' },
              { icon: Building2, label: 'Company', value: profile?.college || 'Stripe' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
                <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] flex items-center justify-center"><Icon size={14} className="text-[#6B7280]" /></div>
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
