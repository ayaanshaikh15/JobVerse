import { useState, useEffect, useCallback } from 'react'
import { fetchResume, uploadResume, deleteResume, saveGeneratedResume } from '../lib/api'

export function useResume(studentId) {
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const data = await fetchResume(studentId)
      setResume(data)
    } catch (err) {
      console.error('Failed to load resume:', err.message)
      setResume(null)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const upload = useCallback(async (file) => {
    const row = await uploadResume(studentId, file)
    setResume(row)
    return row
  }, [studentId])

  const remove = useCallback(async () => {
    if (!resume) return
    await deleteResume(resume)
    setResume(null)
  }, [resume])

  const saveGenerated = useCallback(async (payload) => {
    const row = await saveGeneratedResume(studentId, payload)
    setResume(row)
    return row
  }, [studentId])

  return { resume, loading, upload, remove, saveGenerated, refresh }
}
