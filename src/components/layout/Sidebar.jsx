import useProfileStore from '../../store/useProfileStore'
import { getStorageUsage } from '../../utils/storage'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Sidebar({ isOpen, onClose }) {
  const { profiles, activeProfileId, loadProfile, deleteProfile, resetToSearch } = useProfileStore()
  const usage = getStorageUsage()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
        w-72 bg-gray-50 border-r border-gray-200
        flex flex-col transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* New Search button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => { resetToSearch(); onClose?.() }}
            className="w-full flex items-center justify-center gap-2 bg-navy text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-navy-dark transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            New Search
          </button>
        </div>

        {/* Profile list */}
        <div className="flex-1 overflow-y-auto">
          {profiles.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No saved profiles yet</p>
              <p className="text-xs text-gray-400 mt-1">Profile an attorney, judge, or legal participant to get started</p>
            </div>
          ) : (
            <div className="p-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 py-2">
                Saved Profiles ({profiles.length})
              </p>
              {profiles.map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isActive={profile.id === activeProfileId}
                  onLoad={() => { loadProfile(profile.id); onClose?.() }}
                  onDelete={() => deleteProfile(profile.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Storage usage */}
        {profiles.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Storage used</span>
              <span>{usage.usedMB} MB / ~5 MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${usage.percent > 80 ? 'bg-red-400' : 'bg-sage'}`}
                style={{ width: `${Math.min(usage.percent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

function ProfileCard({ profile, isActive, onLoad, onDelete }) {
  const completedSections = Object.values(profile.sections || {}).filter(s => s.status === 'complete').length
  const totalSections = Object.keys(profile.sections || {}).length

  return (
    <div
      className={`group relative rounded-lg mb-1 cursor-pointer transition-colors ${
        isActive ? 'bg-sage-50 border border-sage-100' : 'hover:bg-white border border-transparent'
      }`}
    >
      <button
        onClick={onLoad}
        className="w-full text-left px-3 py-3 pr-8"
      >
        <div className="flex items-start gap-2">
          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${isActive ? 'text-navy' : 'text-gray-800'}`}>
              {profile.subjectName}
            </p>
            {profile.subjectJurisdiction && (
              <p className="text-xs text-gray-400 truncate">{profile.subjectJurisdiction}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{formatDate(profile.createdAt)}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{completedSections}/{totalSections} sections</span>
            </div>
          </div>
        </div>
      </button>
      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1"
        title="Delete profile"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
    </div>
  )
}
