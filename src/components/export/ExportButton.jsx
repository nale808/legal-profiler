import { useState } from 'react'
import { generateDossierPdf } from '../../utils/pdf'

export default function ExportButton({ profile }) {
  const [generating, setGenerating] = useState(false)

  const completedCount = Object.values(profile?.sections || {}).filter(s => s.status === 'complete').length

  async function handleExport() {
    if (!profile || completedCount === 0) return
    setGenerating(true)
    try {
      generateDossierPdf(profile)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={generating || completedCount === 0}
      className="flex items-center gap-2 bg-sage hover:bg-sage-dark text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      title={completedCount === 0 ? 'No sections complete yet' : 'Export as PDF'}
    >
      {generating ? (
        <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      )}
      {generating ? 'Generating...' : 'Export PDF'}
    </button>
  )
}
