import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, AlertTriangle, X } from 'lucide-react'

export default function SignOutModal({ open, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="relative bg-white rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-[#E2E8F0] w-full max-w-sm p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-[#F8FAFC] text-[#9CA3AF] transition-all"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={26} className="text-red-500" />
            </div>

            <h3
              className="text-lg font-bold text-[#111827] text-center mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Sign out of JobVerse?
            </h3>
            <p className="text-sm text-[#6B7280] text-center mb-6 leading-relaxed">
              You&apos;ll need to sign back in to access your dashboard, applications, and saved jobs.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#374151] bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-all"
              >
                Stay
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
