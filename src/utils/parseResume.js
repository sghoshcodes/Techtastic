import * as pdfjsLib from 'pdfjs-dist'
import { GoogleGenerativeAI } from '@google/generative-ai'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map((item) => item.str).join(' ') + '\n'
  }
  return fullText.trim()
}

function stripFences(text) {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim()
}

function extractJsonObject(text) {
  const cleaned = stripFences(text)
  // First try to parse as-is
  try {
    return JSON.parse(cleaned)
  } catch {
    // Fall back to first {...} block
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1))
    }
    throw new Error('No JSON object found in Gemini response')
  }
}

function buildPrompt(rawText, strict = false) {
  const head = strict
    ? 'You are a resume parser. Output ONLY valid minified JSON. No prose, no markdown, no backticks, no preamble.'
    : 'You are a resume parser. Given the following resume text, extract structured information and return ONLY a valid JSON object with no preamble, no markdown, no backticks.'

  return `${head}

Resume text:
${rawText}

Return this exact JSON structure:
{
  "skills": ["list of technical skills, languages, frameworks, tools found in the resume"],
  "experience_level": "entry or mid or senior",
  "roles_targeted": ["list of role types this person is targeting e.g. SWE, ML Engineer, Data Engineer, Product Manager"],
  "projects": ["brief keywords from notable projects"],
  "keywords": ["any other relevant technical keywords"],
  "grad_year": "graduation year as string, or null if not found"
}`
}

export async function parseResume(file) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to .env (or Vercel project settings) and reload.')
  }

  const rawText = await extractTextFromPDF(file)
  if (!rawText || rawText.length < 40) {
    throw new Error('Could not extract text from this PDF. Is it a scanned image rather than a text PDF?')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  let profile
  try {
    const result = await model.generateContent(buildPrompt(rawText, false))
    profile = extractJsonObject(result.response.text())
  } catch (err) {
    // Retry once with stricter prompt
    const result = await model.generateContent(buildPrompt(rawText, true))
    profile = extractJsonObject(result.response.text())
  }

  // Defensive normalization
  profile.skills = Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : []
  profile.roles_targeted = Array.isArray(profile.roles_targeted) ? profile.roles_targeted.filter(Boolean) : []
  profile.projects = Array.isArray(profile.projects) ? profile.projects.filter(Boolean) : []
  profile.keywords = Array.isArray(profile.keywords) ? profile.keywords.filter(Boolean) : []
  if (typeof profile.experience_level !== 'string') profile.experience_level = 'entry'
  if (profile.grad_year != null && typeof profile.grad_year !== 'string') {
    profile.grad_year = String(profile.grad_year)
  }

  localStorage.setItem('techtastic_profile', JSON.stringify(profile))
  localStorage.setItem('techtastic_profile_updated', String(Date.now()))
  return profile
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem('techtastic_profile')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearProfile() {
  localStorage.removeItem('techtastic_profile')
  localStorage.removeItem('techtastic_profile_updated')
}
