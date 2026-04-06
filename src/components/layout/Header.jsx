import { useState } from 'react'
import SettingsModal from '../settings/SettingsModal'
import useProfileStore from '../../store/useProfileStore'

export default function Header() {
  const [showSettings, setShowSettings] = useState(false)
  const resetToSearch = useProfileStore(s => s.resetToSearch)

  return (
    <>
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-md">
        {/* Logo + Title */}
        <button
          onClick={resetToSearch}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
        >
          <div className="w-9 h-9 bg-sage rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-base leading-tight">Legal Profiler</div>
          </div>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
            title="Settings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Settings
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
