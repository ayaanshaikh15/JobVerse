import { supabase } from './supabase'

// ------------------------------------------------------------
// Dashboard stats
// ------------------------------------------------------------

export async function fetchAdminStats() {
  const [students, recruiters, jobs, applications] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'recruiter'),
    supabase.from('jobs').select('id', { count: 'exact', head: true }),
    supabase.from('applications').select('id', { count: 'exact', head: true }),
  ])

  for (const res of [students, recruiters, jobs, applications]) {
    if (res.error) throw res.error
  }

  return {
    totalStudents: students.count ?? 0,
    totalRecruiters: recruiters.count ?? 0,
    totalJobs: jobs.count ?? 0,
    totalApplications: applications.count ?? 0,
  }
}

// ------------------------------------------------------------
// Students
// ------------------------------------------------------------

export async function fetchAllStudents() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, college, created_at')
    .eq('role', 'student')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function deleteStudent(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw error
}

// ------------------------------------------------------------
// Recruiters
// ------------------------------------------------------------

export async function fetchAllRecruiters() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, college, website, status, created_at')
    .eq('role', 'recruiter')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateRecruiterStatus(id, status) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', id)
    .eq('role', 'recruiter')
    .select()
    .single()
  if (error) throw error
  return data
}

// ------------------------------------------------------------
// Jobs
// ------------------------------------------------------------

export async function fetchAllJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, company, location, recruiter_id, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function deleteJob(id) {
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) throw error
}

// ------------------------------------------------------------
// Applications
// ------------------------------------------------------------

export async function fetchAllApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select('id, student_id, status, created_at, job:jobs(id, title, company)')
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!data || data.length === 0) return []

  const studentIds = [...new Set(data.map(a => a.student_id).filter(Boolean))]
  let profileMap = new Map()
  if (studentIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', studentIds)
    if (profilesError) throw profilesError
    profileMap = new Map((profiles ?? []).map(p => [p.id, p]))
  }

  return data.map(a => ({
    ...a,
    student: profileMap.get(a.student_id) || null,
  }))
}
