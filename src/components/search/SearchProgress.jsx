import { useEffect, useRef } from 'react'
import useProfileStore from '../../store/useProfileStore'

const TYPE_ICONS = {
  search: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage flex-shrink-0 mt-0.5">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  info: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 flex-shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  success: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-dark flex-shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 flex-shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
}

export default function SearchProgress() {
  const { searchProgress, searchStatus, cancelSearch, getActiveProfile } = useProfileStore()
  const logRef = useRef(null)
  const profile = getActiveProfile()

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [searchProgress])

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Subject name */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-50 rounded-2xl mb-4">
          {searchStatus === 'searching' ? (
            <svg className="animate-spin text-sage" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
            </svg>
          ) : searchStatus === 'error' ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c9a82" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <h2 className="text-2xl font-bold text-navy mb-1">
          {searchStatus === 'searching' ? 'Researching...' : searchStatus === 'error' ? 'Research Failed' : 'Research Complete'}
        </h2>
        {profile?.subjectName && profile.subjectName !== 'Unknown Attorney' && (
          <p className="text-gray-500">{profile.subjectName}</p>
        )}
      </div>

      {/* Progress bar */}
      {searchStatus === 'searching' && (
        <div className="mb-6">
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-sage h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      )}

      {/* Log */}
      <div
        ref={logRef}
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 h-72 overflow-y-auto font-mono text-xs space-y-1.5"
      >
        {searchProgress.map((entry, i) => (
          <div key={i} className="flex items-start gap-2">
            {TYPE_ICONS[entry.type] || TYPE_ICONS.info}
            <span className={`leading-relaxed ${
              entry.type === 'error' ? 'text-red-500' :
              entry.type === 'success' ? 'text-sage-dark' :
              entry.type === 'search' ? 'text-gray-600' :
              'text-gray-500'
            }`}>
              {entry.message}
            </span>
          </div>
        ))}
        {searchStatus === 'searching' && (
          <div className="flex items-center gap-2 text-gray-400">
            <span className="inline-block w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="inline-block w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="inline-block w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 mt-6">
        {searchStatus === 'searching' && (
          <button
            onClick={cancelSearch}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-4 py-2 rounded-lg transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
            Cancel Search
          </button>
        )}
      </div>
    </div>
  )
}
