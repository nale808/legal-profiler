const SETTINGS_KEY = 'ocp_settings_v1'
const PROFILES_KEY = 'ocp_profiles_v1'

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

export function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveProfiles(profiles) {
  try {
    // Strip searchLog to save space before persisting
    const stripped = profiles.map(p => ({ ...p, searchLog: [] }))
    localStorage.setItem(PROFILES_KEY, JSON.stringify(stripped))
  } catch (e) {
    console.error('Failed to save profiles:', e)
  }
}

export function getStorageUsage() {
  let total = 0
  for (const key of [SETTINGS_KEY, PROFILES_KEY]) {
    const item = localStorage.getItem(key)
    if (item) total += item.length * 2 // UTF-16
  }
  const maxBytes = 5 * 1024 * 1024 // ~5MB
  return {
    usedBytes: total,
    maxBytes,
    usedMB: (total / (1024 * 1024)).toFixed(2),
    percent: Math.round((total / maxBytes) * 100),
  }
}
