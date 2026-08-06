import { useState, useEffect, useCallback } from 'react'
import {
  bootstrapJobs,
  fetchJobs,
  fetchJob,
  insertJob,
  updateJob as updateJobApi,
  deleteJob as deleteJobApi,
  fetchRecruiterJobs,
  fetchSavedJobIds,
  toggleSavedJob as toggleSavedJobApi,
} from '../lib/api'

export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      await bootstrapJobs()
      const data = await fetchJobs()
      setJobs(data)
    } catch (err) {
      console.error('Failed to load jobs:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addJob = useCallback(async (job) => {
    const created = await insertJob(job)
    setJobs(prev => [created, ...prev])
    return created
  }, [])

  const deleteJob = useCallback(async (id) => {
    await deleteJobApi(id)
    setJobs(prev => prev.filter(j => j.id !== id))
  }, [])

  return { jobs, loading, addJob, deleteJob, refresh }
}

export function useRecruiterJobs(recruiterId) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!recruiterId) {
      setJobs([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchRecruiterJobs(recruiterId)
      setJobs(data)
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err.message)
    } finally {
      setLoading(false)
    }
  }, [recruiterId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addJob = useCallback(async (job) => {
    const created = await insertJob(job)
    setJobs(prev => [created, ...prev])
    return created
  }, [])

  const deleteJob = useCallback(async (id) => {
    await deleteJobApi(id, recruiterId)
    setJobs(prev => prev.filter(j => j.id !== id))
  }, [recruiterId])

  const updateJob = useCallback(async (id, payload) => {
    const updated = await updateJobApi(id, payload, recruiterId)
    setJobs(prev => prev.map(j => (j.id === id ? { ...j, ...updated } : j)))
    return updated
  }, [recruiterId])

  return { jobs, loading, addJob, deleteJob, updateJob, refresh }
}

export function useSavedJobs(studentId) {
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!studentId) {
      setSaved([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const ids = await fetchSavedJobIds(studentId)
      setSaved(ids)
    } catch (err) {
      console.error('Failed to load saved jobs:', err.message)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggle = useCallback(async (jobId) => {
    if (!studentId) return
    const nowSaved = await toggleSavedJobApi(studentId, jobId)
    setSaved(prev => nowSaved ? [...prev, jobId] : prev.filter(id => id !== jobId))
    return nowSaved
  }, [studentId])

  const isSaved = useCallback((jobId) => saved.includes(jobId), [saved])

  return { saved, toggle, isSaved, loading, refresh }
}
