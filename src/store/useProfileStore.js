import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createEmptyDossier } from '../data/dossierSchema'
import { generateId } from '../utils/id'
import { saveProfiles } from '../utils/storage'

const useProfileStore = create(
  persist(
    (set, get) => ({
      profiles: [],           // saved dossier history
      activeProfileId: null,  // which profile is being viewed/edited
      searchStatus: 'idle',   // idle | searching | complete | error
      searchProgress: [],     // [{ message, timestamp, type }]
      abortController: null,  // for cancelling searches

      // ─── Computed ───────────────────────────────────────────────
      getActiveProfile: () => {
        const { profiles, activeProfileId } = get()
        return profiles.find(p => p.id === activeProfileId) || null
      },

      // ─── Search lifecycle ────────────────────────────────────────
      startSearch: (input) => {
        const id = generateId()
        const profile = createEmptyDossier(id, input)
        const ac = new AbortController()
        set(state => ({
          profiles: [profile, ...state.profiles],
          activeProfileId: id,
          searchStatus: 'searching',
          searchProgress: [],
          abortController: ac,
        }))
        return { id, signal: ac.signal }
      },

      addProgress: (message, type = 'info') => {
        set(state => ({
          searchProgress: [
            ...state.searchProgress,
            { message, type, timestamp: new Date().toISOString() },
          ],
        }))
      },

      updateSection: (profileId, sectionKey, content, sources = []) => {
        set(state => ({
          profiles: state.profiles.map(p =>
            p.id === profileId
              ? {
                  ...p,
                  sections: {
                    ...p.sections,
                    [sectionKey]: {
                      ...p.sections[sectionKey],
                      content,
                      sources,
                      status: 'complete',
                    },
                  },
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
      },

      setSectionStatus: (profileId, sectionKey, status) => {
        set(state => ({
          profiles: state.profiles.map(p =>
            p.id === profileId
              ? {
                  ...p,
                  sections: {
                    ...p.sections,
                    [sectionKey]: { ...p.sections[sectionKey], status },
                  },
                }
              : p
          ),
        }))
      },

      setSubjectName: (profileId, name) => {
        set(state => ({
          profiles: state.profiles.map(p =>
            p.id === profileId ? { ...p, subjectName: name } : p
          ),
        }))
      },

      completeSearch: () => {
        set({ searchStatus: 'complete', abortController: null })
        saveProfiles(get().profiles)
      },

      failSearch: (error) => {
        set(state => ({
          searchStatus: 'error',
          abortController: null,
          searchProgress: [
            ...state.searchProgress,
            { message: `Error: ${error}`, type: 'error', timestamp: new Date().toISOString() },
          ],
        }))
      },

      cancelSearch: () => {
        const { abortController } = get()
        if (abortController) abortController.abort()
        set({ searchStatus: 'idle', abortController: null })
      },

      // ─── Profile management ──────────────────────────────────────
      loadProfile: (id) => {
        set({ activeProfileId: id, searchStatus: 'complete', searchProgress: [] })
      },

      deleteProfile: (id) => {
        set(state => {
          const profiles = state.profiles.filter(p => p.id !== id)
          const activeProfileId =
            state.activeProfileId === id
              ? (profiles[0]?.id || null)
              : state.activeProfileId
          saveProfiles(profiles)
          return {
            profiles,
            activeProfileId,
            searchStatus: activeProfileId ? state.searchStatus : 'idle',
          }
        })
      },

      renameProfile: (id, name) => {
        set(state => ({
          profiles: state.profiles.map(p =>
            p.id === id ? { ...p, subjectName: name } : p
          ),
        }))
        saveProfiles(get().profiles)
      },

      saveNote: (profileId, sectionKey, note) => {
        set(state => ({
          profiles: state.profiles.map(p =>
            p.id === profileId
              ? {
                  ...p,
                  sections: {
                    ...p.sections,
                    [sectionKey]: { ...p.sections[sectionKey], notes: note },
                  },
                }
              : p
          ),
        }))
        saveProfiles(get().profiles)
      },

      resetToSearch: () => {
        set({ activeProfileId: null, searchStatus: 'idle', searchProgress: [] })
      },
    }),
    {
      name: 'ocp_profiles_v1',
      partialize: (state) => ({
        profiles: state.profiles.map(p => ({ ...p, searchLog: [] })),
        activeProfileId: state.activeProfileId,
      }),
    }
  )
)

export default useProfileStore
