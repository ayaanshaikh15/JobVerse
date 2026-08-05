import { useState, useEffect, useCallback } from 'react'
import {
  fetchStudentApplications,
  fetchRecruiterApplications,
  updateApplicationStatus,
  updateApplicationWithDetails,
} from '../lib/api'

export function useStudentApplications(studentId) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const data = await fetchStudentApplications(studentId)
      setApplications(data)
    } catch (err) {
      console.error('Failed to load applications:', err.message)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { applications, loading, refresh }
}

export function useRecruiterApplications(recruiterId) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!recruiterId) {
      setApplications([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchRecruiterApplications(recruiterId)
      setApplications(data)
    } catch (err) {
      console.error('Failed to load applicants:', err.message)
    } finally {
      setLoading(false)
    }
  }, [recruiterId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateStatus = useCallback(async (id, status) => {
    await updateApplicationStatus(id, status)
    setApplications(prev => prev.map(a => (a.id === id ? { ...a, status } : a)))
  }, [])

  const updateWithDetails = useCallback(async (id, details) => {
    const updated = await updateApplicationWithDetails(id, details)
    setApplications(prev => prev.map(a => (a.id === id ? { ...a, ...updated } : a)))
    return updated
  }, [])

  return { applications, loading, updateStatus, updateWithDetails, refresh }
}
