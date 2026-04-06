import useProfileStore from '../../store/useProfileStore'
import { DOSSIER_SECTIONS } from '../../data/dossierSchema'
import DossierSection from './DossierSection'
import SectionNav from './SectionNav'
import ExportButton from '../export/ExportButton'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function DossierView() {
  const getActiveProfile = useProfileStore(s => s.getActiveProfile)
  const profile = getActiveProfile()

  if (!profile) return null

  const completedCount = Object.values(profile.sections).filter(s => s.status === 'complete').length
  const totalCount = DOSSIER_SECTIONS.length

  return (
    <div className="flex gap-6 px-6 py-6 max-w-6xl mx-auto w-full">
      {/* Section nav — sticky left sidebar */}
      <SectionNav sections={profile.sections} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Dossier header */}
        <div className="bg-navy text-white rounded-2xl px-6 py-5 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-sage rounded-md flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Legal Intelligence Dossier</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{profile.subjectName}</h1>
            {profile.subjectJurisdiction && (
              <p className="text-white/60 text-sm mt-0.5">{profile.subjectJurisdiction}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
              <span>Generated {formatDate(profile.createdAt)}</span>
              <span>·</span>
              <span>{completedCount}/{totalCount} sections complete</span>
            </div>
          </div>
          <ExportButton profile={profile} />
        </div>

        {/* Progress bar */}
        {completedCount < totalCount && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Research progress</span>
              <span>{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-sage h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Sections */}
        {DOSSIER_SECTIONS.map(sectionDef => (
          <DossierSection
            key={sectionDef.key}
            sectionDef={sectionDef}
            data={profile.sections[sectionDef.key]}
            profileId={profile.id}
          />
        ))}
      </div>
    </div>
  )
}
