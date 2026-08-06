const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'

export function isGeminiConfigured() {
  return !!API_KEY
}

// Asks Gemini to rewrite the candidate's details into an ATS-optimized resume
// and returns a normalized resume object + an ATS score + improvement feedback.
export async function generateResume(data) {
  if (!API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
  }

  const prompt = `You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

The final resume is rendered as a PDF titled "Resume", centered at the top with a black divider line below it. It begins with a "Personal Information" section displayed as labeled rows (Name, Email, Phone no, LinkedIn, Github), followed by Summary, Education, Skills, Projects, Experience, and Certifications & Awards sections.

Rewrite the candidate's raw details below into a polished, ATS-friendly resume that fits this layout. Improve section ordering, expand terse bullet points into strong, quantified achievements, and reword skills and project descriptions with strong action verbs and keywords that real ATS systems look for. Keep everything truthful to the provided information — do NOT invent facts, companies, or dates.

Candidate details (JSON):
${JSON.stringify(data, null, 2)}

Respond with VALID JSON ONLY, no markdown fences, in EXACTLY this shape:
{
  "resume": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "github": "string",
    "summary": "one strong professional summary (2-3 sentences)",
    "education": [{ "school": "string", "degree": "string", "details": "CGPA / year / honors" }],
    "skills": ["string"],
    "projects": [{ "name": "string", "description": "one quantified achievement sentence" }],
    "experience": [{ "title": "string", "company": "string", "duration": "string", "description": "2-3 strong bullet sentences" }],
    "achievements": ["string"]
  },
  "atsScore": 0,
  "feedback": ["short, specific improvement suggestions as strings"]
}
The atsScore is an integer from 0 to 100 estimating how well this resume would pass ATS filters. Make sure name, email, phone, linkedin, and github are always filled from the candidate details (leave a field empty if unknown).`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  if (!response.ok) {
    let detail = `Gemini request failed (${response.status})`
    try {
      const err = await response.json()
      detail = err?.error?.message || detail
    } catch {
      // ignore — use the generic detail
    }
    throw new Error(detail)
  }

  const json = await response.json()
  const text = json?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || ''

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Gemini returned an unparseable response')
    parsed = JSON.parse(match[0])
  }

  const resume = parsed?.resume && typeof parsed.resume === 'object' ? parsed.resume : parsed
  const score = Math.round(Number(parsed?.atsScore))
  const atsScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 92

  return {
    resume,
    atsScore,
    feedback: Array.isArray(parsed?.feedback) ? parsed.feedback.filter(Boolean) : [],
  }
}
