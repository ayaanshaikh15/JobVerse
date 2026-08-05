import { supabase } from './supabase'
import { mockJobs } from './mockData'

const JOB_FIELDS =
  'id, title, company, company_logo, location, salary, salary_min, salary_max, description, skills, requirements, benefits, recruiter_id, type, category, created_at'

export async function fetchJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_FIELDS)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchJob(id) {
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_FIELDS)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchJobForRecruiter(id, recruiterId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_FIELDS)
    .eq('id', id)
    .eq('recruiter_id', recruiterId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function insertJob(payload) {
  const { data, error } = await supabase.from('jobs').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateJob(id, payload, recruiterId) {
  if (recruiterId) {
    const owned = await fetchJobForRecruiter(id, recruiterId)
    if (!owned) throw new Error('You can only edit your own jobs')
  }
  const { data, error } = await supabase.from('jobs').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteJob(id, recruiterId) {
  if (recruiterId) {
    const owned = await fetchJobForRecruiter(id, recruiterId)
    if (!owned) throw new Error('You can only delete your own jobs')
  }
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) throw error
}

export async function fetchRecruiterJobs(recruiterId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(JOB_FIELDS)
    .eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/**
 * Seeds the jobs table with the demo mock jobs on first run
 * (only when the table is empty). Seeded jobs have recruiter_id = null.
 */
export async function bootstrapJobs() {
  const { count, error } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  if (count && count > 0) return

  const seed = mockJobs.map((j) => ({
    title: j.title,
    company: j.company,
    company_logo: j.company_logo,
    location: j.location,
    salary: j.salary,
    salary_min: j.salary_min,
    salary_max: j.salary_max,
    description: j.description,
    skills: j.skills,
    requirements: j.requirements,
    benefits: j.benefits,
    type: j.type,
    category: j.category,
    created_at: j.created_at,
    recruiter_id: null,
  }))

  const { error: insertError } = await supabase.from('jobs').insert(seed)
  if (insertError) throw insertError
}

// ------------------------------------------------------------
// Applications
// ------------------------------------------------------------

export async function applyToJob(studentId, jobId, resumeId) {
  const { data, error } = await supabase
    .from('applications')
    .insert({ student_id: studentId, job_id: jobId, resume_id: resumeId ?? null, status: 'applied' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchStudentApplications(studentId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, job:jobs(*)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchApplicationForJob(studentId, jobId) {
  const { data, error } = await supabase
    .from('applications')
    .select('id, status, created_at')
    .eq('student_id', studentId)
    .eq('job_id', jobId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchRecruiterApplications(recruiterId) {
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id')
    .eq('recruiter_id', recruiterId)
  if (jobsError) throw jobsError

  const jobIds = (jobs ?? []).map((j) => j.id)
  if (jobIds.length === 0) return []

  const { data, error } = await supabase
    .from('applications')
    .select('*, job:jobs(*)')
    .in('job_id', jobIds)
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!data || data.length === 0) return []

  const studentIds = [...new Set(data.map(a => a.student_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email, college')
    .in('id', studentIds)

  const resumeIds = [...new Set(data.map(a => a.resume_id).filter(Boolean))]
  let resumes = []
  if (resumeIds.length > 0) {
    const { data: resumeData } = await supabase
      .from('resumes')
      .select('id, resume_url, file_name, resume_type, content, student_id')
      .in('id', resumeIds)
    resumes = resumeData ?? []
  }

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))
  const resumeMap = new Map(resumes.map(r => [r.id, r]))
  return data.map(a => ({
    ...a,
    profile: profileMap.get(a.student_id) || null,
    resume: a.resume_id ? resumeMap.get(a.resume_id) || null : null,
  }))
}

const STATUS_TRANSITIONS = {
  applied: ['reviewing', 'rejected'],
  reviewing: ['interview', 'rejected'],
  interview: ['attended', 'rejected'],
  attended: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
}

async function assertValidTransition(id, nextStatus) {
  const { data, error } = await supabase
    .from('applications')
    .select('status')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Application not found')
  const allowed = STATUS_TRANSITIONS[data.status] || []
  if (nextStatus !== data.status && !allowed.includes(nextStatus)) {
    throw new Error(`Cannot change status from "${data.status}" to "${nextStatus}"`)
  }
}

export async function updateApplicationStatus(id, status) {
  await assertValidTransition(id, status)
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updateApplicationWithDetails(id, { status, note, interview_at }) {
  await assertValidTransition(id, status)
  const payload = { status, updated_at: new Date().toISOString() }
  if (note !== undefined) payload.note = note
  if (interview_at !== undefined) payload.interview_at = interview_at
  const { data, error } = await supabase.from('applications').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ------------------------------------------------------------
// Resumes + Storage
// ------------------------------------------------------------

const RESUME_BUCKET = 'resumes'

export async function fetchResume(studentId) {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Returns the student's AI-generated resume if one exists (any older one,
 * not just the latest row). Used to enforce the one-AI-resume-per-user rule.
 */
export async function fetchAiResume(studentId) {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('student_id', studentId)
    .eq('resume_type', 'ai_generated')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function uploadResume(studentId, file) {
  const ext = (file.name.split('.').pop() || 'pdf').toLowerCase()
  const path = `${studentId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError

  const { data: publicUrl } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(path)

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      student_id: studentId,
      resume_type: 'uploaded',
      resume_url: publicUrl.publicUrl,
      file_name: file.name,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteResume(resume) {
  if (resume?.resume_url) {
    const url = new URL(resume.resume_url)
    const path = url.pathname.split('/').slice(2).join('/')
    if (path) {
      await supabase.storage.from(RESUME_BUCKET).remove([path])
    }
  }
  const { error } = await supabase.from('resumes').delete().eq('id', resume.id)
  if (error) throw error
}

export async function saveGeneratedResume(studentId, payload) {
  const { data, error } = await supabase
    .from('resumes')
    .insert({
      student_id: studentId,
      resume_type: 'ai_generated',
      resume_url: '',
      file_name: `${(payload.name || 'resume').replace(/\s+/g, '-').toLowerCase()}.json`,
      content: JSON.stringify(payload),
    })
    .select()
    .single()
  if (error) throw error
  return data
}
