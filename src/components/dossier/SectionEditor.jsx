import { useState } from 'react'
import useProfileStore from '../../store/useProfileStore'

export default function SectionEditor({ profileId, sectionKey, sectionTitle, existingNotes, onClose }) {
  const [notes, setNotes] = useState(existingNotes || '')
  const saveNote = useProfileStore(s => s.saveNote)

  function handleSave() {
    saveNote(profileId, sectionKey, notes)
    onClose()
  }

  return (
    <div className="mt-3 bg-sage-50 border border-sage-100 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-navy mb-2 flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Notes for {sectionTitle}
      </h4>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Add your own notes, observations, or strategy for this section..."
        rows={4}
        className="w-full border border-sage-100 bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
      />
      <div className="flex gap-2 mt-2 justify-end">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="text-sm bg-sage text-white hover:bg-sage-dark px-4 py-1.5 rounded-lg transition-colors font-medium"
        >
          Save Notes
        </button>
      </div>
    </div>
  )
}
