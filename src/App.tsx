import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import RoleSelect from './pages/auth/RoleSelect'

import StudentDashboard from './pages/student/Dashboard'
import Jobs from './pages/student/Jobs'
import JobDetail from './pages/student/JobDetail'
import Resume from './pages/student/Resume'
import AIResumeBuilder from './pages/student/AIResumeBuilder'
import Applications from './pages/student/Applications'
import StudentProfile from './pages/student/Profile'

import RecruiterDashboard from './pages/recruiter/Dashboard'
import PostJob from './pages/recruiter/PostJob'
import MyJobs from './pages/recruiter/MyJobs'
import Applicants from './pages/recruiter/Applicants'
import RecruiterProfile from './pages/recruiter/Profile'

function ProtectedRoute({ children, role, allowIncomplete }) {
  const { user, profile, loading, isProfileComplete, onboardingPath } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!allowIncomplete && !isProfileComplete(profile)) {
    return <Navigate to={onboardingPath(profile)} replace />
  }
  if (role && profile?.role && profile.role !== role) {
    return <Navigate to={profile.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'} replace />
  }
  return children
}

function AppRoutes() {
  const { user, profile, loading, isProfileComplete, onboardingPath } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }
  const homeDestination = !isProfileComplete(profile)
    ? onboardingPath(profile)
    : profile?.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={homeDestination} replace /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/role-select" element={<ProtectedRoute allowIncomplete><RoleSelect /></ProtectedRoute>} />

      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/jobs" element={<ProtectedRoute role="student"><Jobs /></ProtectedRoute>} />
      <Route path="/student/jobs/:id" element={<ProtectedRoute role="student"><JobDetail /></ProtectedRoute>} />
      <Route path="/student/resume" element={<ProtectedRoute role="student"><Resume /></ProtectedRoute>} />
      <Route path="/student/resume/builder" element={<ProtectedRoute role="student"><AIResumeBuilder /></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute role="student"><Applications /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student" allowIncomplete><StudentProfile /></ProtectedRoute>} />

      <Route path="/recruiter/dashboard" element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/post-job" element={<ProtectedRoute role="recruiter"><PostJob /></ProtectedRoute>} />
      <Route path="/recruiter/edit-job/:id" element={<ProtectedRoute role="recruiter"><PostJob /></ProtectedRoute>} />
      <Route path="/recruiter/jobs" element={<ProtectedRoute role="recruiter"><MyJobs /></ProtectedRoute>} />
      <Route path="/recruiter/applicants" element={<ProtectedRoute role="recruiter"><Applicants /></ProtectedRoute>} />
      <Route path="/recruiter/profile" element={<ProtectedRoute role="recruiter" allowIncomplete><RecruiterProfile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              borderRadius: '14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
            },
          }}
        />
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
