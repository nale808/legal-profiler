import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { DOSSIER_SECTIONS } from '../data/dossierSchema'

const NAVY = [30, 58, 95]
const SAGE = [124, 154, 130]
const LIGHT_GRAY = [248, 249, 250]
const MED_GRAY = [107, 114, 128]
const BLACK = [26, 26, 46]

function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/#{1,6}\s+/g, '')      // headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1')    // italic
    .replace(/`(.+?)`/g, '$1')      // code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/^[-*+]\s+/gm, '• ')   // bullets
    .replace(/\n{3,}/g, '\n\n')     // extra newlines
    .trim()
}

function addPageFooter(doc, pageNum, totalPages, subjectName) {
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  doc.setFillColor(...NAVY)
  doc.rect(0, pageH - 14, pageW, 14, 'F')

  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.text('CONFIDENTIAL - ATTORNEY WORK PRODUCT', 14, pageH - 5)
  doc.text(`${subjectName} | Page ${pageNum} of ${totalPages}`, pageW - 14, pageH - 5, { align: 'right' })
}

export function generateDossierPdf(profile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentW = pageW - margin * 2

  // ── Cover Page ───────────────────────────────────────────────────────
  // Navy header band
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageW, 60, 'F')

  // Sage accent bar
  doc.setFillColor(...SAGE)
  doc.rect(0, 60, pageW, 3, 'F')

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('OPPOSING COUNSEL INTELLIGENCE DOSSIER', pageW / 2, 28, { align: 'center' })

  doc.setFontSize(26)
  doc.text(profile.subjectName.toUpperCase(), pageW / 2, 46, { align: 'center' })

  // Subject info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BLACK)
  let y = 80

  const infoRows = []
  if (profile.subjectJurisdiction) infoRows.push(['Jurisdiction', profile.subjectJurisdiction])
  infoRows.push(['Report Date', new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })])
  const completedSections = Object.values(profile.sections).filter(s => s.status === 'complete').length
  infoRows.push(['Sections Completed', `${completedSections} of ${DOSSIER_SECTIONS.length}`])
  if (profile.input?.type === 'name' && profile.input?.firmName) {
    infoRows.push(['Firm', profile.input.firmName])
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: infoRows,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3, textColor: BLACK },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, textColor: NAVY },
      1: { cellWidth: contentW - 45 },
    },
  })

  // Confidentiality notice
  y = (doc.lastAutoTable?.finalY || 110) + 20
  doc.setFillColor(248, 242, 242)
  doc.setDrawColor(192, 57, 43)
  doc.roundedRect(margin, y, contentW, 22, 2, 2, 'FD')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(192, 57, 43)
  doc.text('CONFIDENTIAL - ATTORNEY WORK PRODUCT', margin + 4, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MED_GRAY)
  doc.text(
    'This document contains privileged and confidential information prepared in anticipation of litigation.',
    margin + 4, y + 15,
    { maxWidth: contentW - 8 }
  )

  // Section index
  y += 36
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text('TABLE OF CONTENTS', margin, y)
  y += 6
  doc.setFillColor(...SAGE)
  doc.rect(margin, y, 30, 1, 'F')
  y += 8

  DOSSIER_SECTIONS.forEach((section, idx) => {
    const status = profile.sections[section.key]?.status
    doc.setFont('helvetica', status === 'complete' ? 'normal' : 'normal')
    doc.setFontSize(9.5)
    if (status === 'complete') doc.setTextColor(...BLACK)
    else doc.setTextColor(...MED_GRAY)
    doc.text(`${idx + 1}.  ${section.title}`, margin + 4, y)
    if (status !== 'complete') {
      doc.setFontSize(7.5)
      doc.setTextColor(...MED_GRAY)
      doc.text('Not researched', pageW - margin, y, { align: 'right' })
    }
    y += 7
  })

  // ── Content Pages ────────────────────────────────────────────────────
  DOSSIER_SECTIONS.forEach((sectionDef) => {
    const sectionData = profile.sections[sectionDef.key]
    if (!sectionData || sectionData.status !== 'complete' || !sectionData.content) return

    doc.addPage()
    y = margin

    // Section title bar
    doc.setFillColor(...NAVY)
    doc.rect(0, 0, pageW, 18, 'F')
    doc.setFillColor(...SAGE)
    doc.rect(0, 18, pageW, 1.5, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text(sectionDef.title.toUpperCase(), margin, 12)

    if (sectionData.confidence) {
      const conf = sectionData.confidence.charAt(0).toUpperCase() + sectionData.confidence.slice(1)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(255, 255, 255)
      doc.text(`${conf} Confidence`, pageW - margin, 12, { align: 'right' })
    }

    y = 26

    // Content
    const cleanContent = stripMarkdown(sectionData.content)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...BLACK)

    const lines = doc.splitTextToSize(cleanContent, contentW)
    const lineHeight = 5.5
    const usableH = pageH - 20 - y // leave room for footer

    lines.forEach(line => {
      if (y + lineHeight > pageH - 20) {
        doc.addPage()
        y = margin
        // Continuation header
        doc.setFillColor(...LIGHT_GRAY)
        doc.rect(0, 0, pageW, 12, 'F')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(...MED_GRAY)
        doc.text(`${sectionDef.title} (continued)`, margin, 8)
        y = 18
      }
      // Bold lines that look like headers (all caps or short)
      if (line.startsWith('•')) {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...BLACK)
      } else if (line === line.toUpperCase() && line.length > 3 && line.length < 60) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...NAVY)
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...BLACK)
      }
      doc.text(line, margin, y)
      y += lineHeight
    })

    // User notes
    if (sectionData.notes) {
      y += 4
      doc.setFillColor(255, 251, 235)
      doc.setDrawColor(251, 191, 36)
      const noteLines = doc.splitTextToSize(sectionData.notes, contentW - 8)
      const noteH = noteLines.length * 5 + 12
      doc.roundedRect(margin, y, contentW, noteH, 2, 2, 'FD')
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(146, 64, 14)
      doc.text('YOUR NOTES', margin + 4, y + 7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 53, 15)
      doc.text(noteLines, margin + 4, y + 13)
      y += noteH + 4
    }

    // Sources
    if (sectionData.sources?.length > 0) {
      if (y > pageH - 50) { doc.addPage(); y = margin }
      y += 4
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...SAGE)
      doc.text('SOURCES', margin, y)
      y += 5
      sectionData.sources.slice(0, 8).forEach(src => {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(124, 154, 130)
        const srcLine = doc.splitTextToSize(`• ${src.title || src.url}`, contentW - 4)
        doc.text(srcLine, margin + 2, y)
        y += srcLine.length * 4.5
      })
    }
  })

  // Add footers to all pages
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addPageFooter(doc, i, totalPages, profile.subjectName)
  }

  doc.save(`${profile.subjectName.replace(/\s+/g, '_')}_Dossier.pdf`)
}
