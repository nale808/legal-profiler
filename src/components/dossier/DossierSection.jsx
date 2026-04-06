import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import SectionEditor from './SectionEditor'

const CONFIDENCE_BADGE = {
  high:   { label: 'High confidence',   cls: 'bg-sage-50 text-sage-dark border-sage-100' },
  medium: { label: 'Medium confidence', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  low:    { label: 'Low confidence',    cls: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const SECTION_ICONS = {
  clipboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  briefcase: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  flag: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  globe: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  alert: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  target: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
}

export default function DossierSection({ sectionDef, data, profileId }) {
  const [showEditor, setShowEditor] = useState(false)
  const [showSources, setShowSources] = useState(false)

  const { key, title, icon, description } = sectionDef
  const status = data?.status || 'pending'
  const content = data?.content || ''
  const sources = data?.sources || []
  const notes = data?.notes || ''
  const confidence = data?.confidence

  const isRedFlags = key === 'redFlags'
  const isStrategic = key === 'strategicRecommendations'

  return (
    <section
      id={`section-${key}`}
      className={`rounded-2xl border mb-4 overflow-hidden ${
        isRedFlags && content ? 'border-red-100 bg-red-flag-bg' :
        isStrategic && content ? 'border-sage-100 bg-sage-50' :
        'border-gray-200 bg-white'
      }`}
    >
      {/* Section Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${
        isRedFlags && content ? 'border-red-100' :
        isStrategic && content ? 'border-sage-100' :
        'border-gray-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isRedFlags ? 'bg-red-100 text-red-flag' :
            isStrategic ? 'bg-sage-100 text-sage-dark' :
            'bg-navy/5 text-navy'
          }`}>
            {SECTION_ICONS[icon]}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-navy">{title}</h3>
            {status === 'pending' && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {confidence && CONFIDENCE_BADGE[confidence] && (
            <span className={`text-xs border px-2 py-0.5 rounded-full ${CONFIDENCE_BADGE[confidence].cls}`}>
              {CONFIDENCE_BADGE[confidence].label}
            </span>
          )}
          {status === 'searching' && (
            <svg className="animate-spin text-amber-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
            </svg>
          )}
          {content && (
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="text-xs text-gray-400 hover:text-navy border border-gray-200 hover:border-navy/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Notes
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {status === 'pending' && (
          <div className="text-center py-6">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-sm text-gray-400">Not yet researched</p>
          </div>
        )}

        {status === 'searching' && (
          <div className="text-center py-6">
            <div className="flex justify-center gap-1 mb-2">
              {[0, 150, 300].map(delay => (
                <div key={delay} className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
            <p className="text-sm text-gray-400">Searching...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">
            Search failed for this section. Try a deep dive to retry.
          </div>
        )}

        {content && (
          <div className={`prose-dossier text-sm text-gray-700 ${isRedFlags ? 'text-red-800' : ''}`}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {/* User notes */}
        {notes && !showEditor && (
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
            <p className="text-xs font-medium text-amber-700 mb-1">Your Notes</p>
            <p className="text-sm text-amber-800 whitespace-pre-wrap">{notes}</p>
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              {showSources ? 'Hide' : 'Show'} {sources.length} source{sources.length !== 1 ? 's' : ''}
            </button>
            {showSources && (
              <ul className="mt-2 space-y-1">
                {sources.map((src, i) => (
                  <li key={i} className="text-xs">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage hover:text-sage-dark underline truncate block max-w-full"
                    >
                      {src.title || src.url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Inline notes editor */}
        {showEditor && (
          <SectionEditor
            profileId={profileId}
            sectionKey={key}
            sectionTitle={title}
            existingNotes={notes}
            onClose={() => setShowEditor(false)}
          />
        )}
      </div>
    </section>
  )
}
