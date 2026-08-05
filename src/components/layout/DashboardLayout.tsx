import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import MobileNav from './MobileNav'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopNav />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1 p-4 md:p-6 pb-24 lg:pb-6"
        >
          {children}
        </motion.main>
      </div>
      <MobileNav />
    </div>
  )
}
