import { useState } from 'react'
import useProfileStore from '../../store/useProfileStore'
import useSettingsStore from '../../store/useSettingsStore'
import { runSearch } from '../../api/orchestrator'

const US_JURISDICTIONS = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','Washington D.C.',
  'Federal - 1st Circuit','Federal - 2nd Circuit','Federal - 3rd Circuit',
  'Federal - 4th Circuit','Federal - 5th Circuit','Federal - 6th Circuit',
  'Federal - 7th Circuit','Federal - 8th Circuit','Federal - 9th Circuit',
  'Federal - 10th Circuit','Federal - 11th Circuit','Federal - D.C. Circuit',
]

const TABS = [
  { id: 'name', label: 'Name + Jurisdiction' },
  { id: 'bar', label: 'Bar Number' },
  { id: 'urls', label: 'Paste URLs' },
]

export default function SearchForm() {
  const [activeTab, setActiveTab] = useState('name')
  const [nameForm, setNameForm] = useState({ name: '', jurisdiction: '', firmName: '' })
  const [barForm, setBarForm] = useState({ barNumber: '', jurisdiction: '' })
  const [urlForm, setUrlForm] = useState({ urls: '', name: '', jurisdiction: '' })
  const [error, setError] = useState('')

  const { startSearch, addProgress, updateSection, setSubjectName, completeSearch, failSearch } = useProfileStore()
  const settings = useSettingsStore()

  function validate() {
    if (activeTab === 'name' && !nameForm.name.trim()) return 'Please enter a name.'
    if (activeTab === 'name' && !nameForm.jurisdiction) return 'Please select a jurisdiction.'
    if (activeTab === 'bar' && !barForm.barNumber.trim()) return 'Please enter a bar number.'
    if (activeTab === 'bar' && !barForm.jurisdiction) return 'Please select a state bar.'
    if (activeTab === 'urls' && !urlForm.urls.trim()) return 'Please paste at least one URL.'
    if (!settings.isConfigured()) return 'Please configure an API key in Settings first.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')

    let input
    if (activeTab === 'name') {
      input = { type: 'name', ...nameForm }
    } else if (activeTab === 'bar') {
      input = { type: 'bar', ...barForm }
    } else {
      input = { type: 'urls', ...urlForm }
    }

    const { id, signal } = startSearch(input)

    await runSearch({
      input,
      settings: {
        provider: settings.provider,
        apiKeys: settings.apiKeys,
        models: settings.models,
        customEndpoint: settings.customEndpoint,
      },
      profileId: id,
      actions: {
        updateSection: useProfileStore.getState().updateSection,
        setSubjectName: useProfileStore.getState().setSubjectName,
        addProgress: useProfileStore.getState().addProgress,
        completeSearch: useProfileStore.getState().completeSearch,
        failSearch: useProfileStore.getState().failSearch,
      },
      signal,
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-50 rounded-2xl mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c9a82" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-navy mb-2">Legal Profiler</h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          Build a comprehensive intelligence dossier on any legal proceeding participant: attorneys, judges, opposing counsel, witnesses, or experts.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError('') }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-navy border-b-2 border-navy -mb-px'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tab: Name + Jurisdiction */}
          {activeTab === 'name' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={nameForm.name}
                  onChange={e => setNameForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Jonathan R. Smith"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction / State <span className="text-red-400">*</span></label>
                <select
                  value={nameForm.jurisdiction}
                  onChange={e => setNameForm(f => ({ ...f, jurisdiction: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                >
                  <option value="">Select state or jurisdiction...</option>
                  {US_JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name (optional)</label>
                <input
                  type="text"
                  value={nameForm.firmName}
                  onChange={e => setNameForm(f => ({ ...f, firmName: e.target.value }))}
                  placeholder="e.g. Smith & Associates LLP"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Tab: Bar Number */}
          {activeTab === 'bar' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bar Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={barForm.barNumber}
                  onChange={e => setBarForm(f => ({ ...f, barNumber: e.target.value }))}
                  placeholder="e.g. 123456"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State Bar <span className="text-red-400">*</span></label>
                <select
                  value={barForm.jurisdiction}
                  onChange={e => setBarForm(f => ({ ...f, jurisdiction: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                >
                  <option value="">Select state bar...</option>
                  {US_JURISDICTIONS.slice(0, 51).map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Tab: URLs */}
          {activeTab === 'urls' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seed URLs <span className="text-red-400">*</span></label>
                <textarea
                  value={urlForm.urls}
                  onChange={e => setUrlForm(f => ({ ...f, urls: e.target.value }))}
                  placeholder="Paste one URL per line:&#10;https://www.linkedin.com/in/johnsmith&#10;https://www.calbar.ca.gov/...&#10;https://www.avvo.com/..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">The AI will analyze these pages and expand the search from there.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Known Name (optional)</label>
                  <input
                    type="text"
                    value={urlForm.name}
                    onChange={e => setUrlForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction (optional)</label>
                  <select
                    value={urlForm.jurisdiction}
                    onChange={e => setUrlForm(f => ({ ...f, jurisdiction: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                  >
                    <option value="">State...</option>
                    {US_JURISDICTIONS.slice(0, 51).map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-sage hover:bg-sage-dark text-white font-semibold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Build Profile
          </button>
        </form>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        {[
          { icon: '🔍', label: '15+ sources', desc: 'Bar records, judicial profiles, social media, courts, news' },
          { icon: '🧠', label: 'AI synthesis', desc: 'Behavioral & strategic analysis' },
          { icon: '📄', label: 'PDF export', desc: 'Dossier ready for your files' },
        ].map(card => (
          <div key={card.label} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-sm font-medium text-gray-700">{card.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
