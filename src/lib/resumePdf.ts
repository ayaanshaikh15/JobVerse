import { jsPDF } from 'jspdf'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 16
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

const ACCENT = [0, 0, 0]
const DARK = [17, 24, 39]
const GRAY = [107, 114, 128]
const LIGHT = [148, 163, 184]

const NAME_SIZE = 22
const SECTION_TITLE_SIZE = 11
const BODY_SIZE = 10.5
const SUB_SIZE = 10
const LINE_HEIGHT = 5.4
const SUB_LINE_HEIGHT = 4.8
const BULLET_INDENT = 5
const SECTION_GAP = 9
const BULLET_GAP = 2
const ITEM_GAP = 3.5

function toArray(lines) {
  return Array.isArray(lines) ? lines : [lines]
}

function ensureRoom(doc, y, needed) {
  if (y.current + needed > PAGE_HEIGHT - MARGIN) {
    doc.addPage()
    y.current = MARGIN
  }
}

function drawSectionTitle(doc, y, title) {
  ensureRoom(doc, y, 14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(SECTION_TITLE_SIZE)
  doc.setTextColor(...ACCENT)
  doc.text(title.toUpperCase(), MARGIN, y.current)
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.6)
  doc.line(MARGIN, y.current + 2, PAGE_WIDTH - MARGIN, y.current + 2)
  y.current += 7.5
}

function drawLine(doc, y, text, { bold = false, size = BODY_SIZE, color = DARK, maxWidth = CONTENT_WIDTH } = {}) {
  doc.setFont('helvetica', bold ? 'bold' : 'normal')
  doc.setFontSize(size)
  doc.setTextColor(...color)
  const lines = toArray(doc.splitTextToSize(text, maxWidth))
  lines.forEach(line => {
    ensureRoom(doc, y, LINE_HEIGHT)
    doc.text(line, MARGIN, y.current)
    y.current += LINE_HEIGHT
  })
  return lines.length
}

function drawBullet(doc, y, text, { size = BODY_SIZE, color = DARK } = {}) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(size)
  doc.setTextColor(...color)
  const lines = toArray(doc.splitTextToSize(text, CONTENT_WIDTH - BULLET_INDENT))
  lines.forEach((line, i) => {
    ensureRoom(doc, y, LINE_HEIGHT)
    if (i === 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('•', MARGIN + 0.5, y.current)
      doc.setFont('helvetica', 'normal')
    }
    doc.text(line, MARGIN + BULLET_INDENT, y.current)
    y.current += LINE_HEIGHT
  })
  y.current += BULLET_GAP
}

function drawLabelValue(doc, y, label, value) {
  if (!value) return
  ensureRoom(doc, y, LINE_HEIGHT)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(BODY_SIZE)
  doc.setTextColor(...DARK)
  const labelText = `${label}: `
  doc.text(labelText, MARGIN, y.current)
  doc.setFont('helvetica', 'normal')
  doc.text(value, MARGIN + doc.getTextWidth(labelText), y.current)
  y.current += LINE_HEIGHT
}

function drawHeader(doc, y, resume) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(NAME_SIZE)
  doc.setTextColor(...DARK)
  doc.text('Resume', PAGE_WIDTH / 2, y.current, { align: 'center' })
  y.current += 6

  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(1)
  doc.line(MARGIN, y.current, PAGE_WIDTH - MARGIN, y.current)
  y.current += SECTION_GAP
}

export function downloadResumePdf(resume) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const y = { current: MARGIN }

  drawHeader(doc, y, resume)

  drawSectionTitle(doc, y, 'Personal Information')
  drawLabelValue(doc, y, 'Name', resume.name)
  drawLabelValue(doc, y, 'Email', resume.email)
  drawLabelValue(doc, y, 'Phone no', resume.phone)
  drawLabelValue(doc, y, 'LinkedIn', resume.linkedin)
  drawLabelValue(doc, y, 'Github', resume.github)
  y.current += 3

  if (resume.summary) {
    drawSectionTitle(doc, y, 'Summary')
    drawLine(doc, y, resume.summary)
    y.current += 3
  }

  if (resume.education?.length) {
    drawSectionTitle(doc, y, 'Education')
    resume.education.forEach(edu => {
      if (edu.school) drawLine(doc, y, edu.school, { bold: true })
      const sub = [edu.degree, edu.details].filter(Boolean).join('  ·  ')
      if (sub) drawLine(doc, y, sub, { size: SUB_SIZE, color: GRAY })
      y.current += ITEM_GAP
    })
    y.current += 3
  }

  if (resume.skills?.length) {
    drawSectionTitle(doc, y, 'Skills')
    drawLine(doc, y, resume.skills.join('  ·  '))
    y.current += 3
  }

  if (resume.projects?.length) {
    drawSectionTitle(doc, y, 'Projects')
    resume.projects.forEach(p => {
      if (p.name) drawLine(doc, y, p.name, { bold: true })
      if (p.description) drawBullet(doc, y, p.description)
      y.current += ITEM_GAP
    })
    y.current += 3
  }

  if (resume.experience?.length) {
    drawSectionTitle(doc, y, 'Experience')
    resume.experience.forEach(exp => {
      const title = [exp.title, exp.company].filter(Boolean).join(' · ')
      if (title) drawLine(doc, y, title, { bold: true })
      if (exp.duration) drawLine(doc, y, exp.duration, { size: SUB_SIZE, color: GRAY })
      if (exp.description) drawBullet(doc, y, exp.description)
      y.current += ITEM_GAP
    })
    y.current += 3
  }

  if (resume.achievements?.length) {
    drawSectionTitle(doc, y, 'Certifications & Awards')
    resume.achievements.forEach(a => drawBullet(doc, y, a))
  }

  // Footer page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...LIGHT)
    doc.text(`${i} / ${pageCount}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 8, { align: 'center' })
  }

  doc.save('JobVerse.pdf')
}
