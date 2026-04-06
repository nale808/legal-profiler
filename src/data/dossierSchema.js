export const DOSSIER_SECTIONS = [
  {
    key: 'executiveSummary',
    title: 'Executive Summary',
    icon: 'clipboard',
    description: 'One-paragraph overview of who this attorney is',
    searchFocus: 'general identity and reputation',
  },
  {
    key: 'professionalBackground',
    title: 'Professional Background',
    icon: 'briefcase',
    description: 'Education, bar admissions, firm history, practice areas, notable cases',
    searchFocus: 'education, bar admission, career history, law firm',
  },
  {
    key: 'behavioralStyle',
    title: 'Professional Behavioral Style',
    icon: 'user',
    description: 'Negotiation tendencies, conflict approach, temperament under pressure, decision-making patterns',
    searchFocus: 'negotiation style, courtroom behavior, professional temperament, peer descriptions',
  },
  {
    key: 'communicationProfile',
    title: 'Communication Profile',
    icon: 'chat',
    description: 'Writing tone, formality, response patterns, social media voice',
    searchFocus: 'writing style, public statements, blog posts, interviews, social media tone',
  },
  {
    key: 'politicalProfile',
    title: 'Political & Ideological Profile',
    icon: 'flag',
    description: 'FEC donations, public stances, judicial philosophy, social views',
    searchFocus: 'political donations, FEC records, public political stances, ideology',
  },
  {
    key: 'socialMediaPresence',
    title: 'Social Media Presence',
    icon: 'globe',
    description: 'Platform-by-platform activity, tone, interests, connections',
    searchFocus: 'LinkedIn, Twitter/X, Facebook, social media activity',
  },
  {
    key: 'professionalReputation',
    title: 'Professional Reputation',
    icon: 'star',
    description: 'Avvo/Martindale ratings, peer reviews, bar standing, accolades',
    searchFocus: 'Avvo rating, Martindale-Hubbell, peer reviews, awards, bar standing',
  },
  {
    key: 'redFlags',
    title: 'Red Flags & Vulnerabilities',
    icon: 'alert',
    description: 'Disciplinary actions, malpractice suits, ethical complaints, inconsistencies',
    searchFocus: 'disciplinary action, bar complaint, malpractice, sanctions, ethical violations',
  },
  {
    key: 'strategicRecommendations',
    title: 'Strategic Recommendations',
    icon: 'target',
    description: 'How to approach, communicate, and negotiate with this person',
    searchFocus: 'synthesized from all gathered intelligence',
  },
]

export function createEmptyDossier(id, input) {
  const sections = {}
  DOSSIER_SECTIONS.forEach(s => {
    sections[s.key] = {
      content: '',
      sources: [],
      notes: '',
      status: 'pending', // pending | searching | complete | error | skipped
    }
  })
  return {
    id,
    input,
    subjectName: input.name || input.barNumber || 'Unknown Attorney',
    subjectJurisdiction: input.jurisdiction || '',
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    searchLog: [],
  }
}
