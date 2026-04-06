import { DOSSIER_SECTIONS } from '../data/dossierSchema'

/**
 * Builds the system prompt for the main dossier research task.
 * This is the primary quality lever — the more specific the search
 * instructions, the better the output.
 */
export function buildSystemPrompt() {
  return `You are an expert legal intelligence analyst specializing in attorney opposition research. Your job is to compile comprehensive, accurate profiles of attorneys to help litigators prepare for professional interactions.

You have access to web search tools. Use them extensively and aggressively — perform at least 10-15 distinct searches to build a thorough profile. Search for the attorney from multiple angles.

REQUIRED SEARCHES (perform ALL of these):
1. General identity: "[full name]" attorney [jurisdiction]
2. Bar record: "[full name]" attorney bar admission [state] site:[state bar website]
3. LinkedIn: "[full name]" attorney site:linkedin.com
4. Twitter/X: "[full name]" attorney site:twitter.com OR site:x.com
5. Facebook: "[full name]" attorney site:facebook.com
6. Avvo rating: "[full name]" attorney avvo
7. Martindale-Hubbell: "[full name]" martindale-hubbell
8. Political donations: "[full name]" FEC political donations attorney
9. State political: "[full name]" attorney campaign contribution [state]
10. Court records: "[full name]" attorney court case [jurisdiction]
11. Federal cases: "[full name]" attorney PACER federal court
12. Disciplinary history: "[full name]" attorney disciplinary [state] bar complaint
13. News coverage: "[full name]" attorney [jurisdiction] news OR verdict
14. Publications: "[full name]" attorney law review article publication
15. Firm bio: "[full name]" attorney firm biography [firm name if known]

Be thorough. If initial searches don't find much, try variations (first name only, maiden name, nickname, different jurisdiction formats).

IMPORTANT: You must return a single valid JSON object. No markdown fences, no preamble, no explanation — ONLY the JSON.

The JSON must have this exact structure:
{
  "subjectName": "Full Name of Attorney",
  "executiveSummary": {
    "content": "## Overview\\n...",
    "sources": [{"url": "...", "title": "..."}],
    "confidence": "high|medium|low"
  },
  "professionalBackground": {
    "content": "## Education\\n...\\n## Career History\\n...\\n## Practice Areas\\n...\\n## Notable Cases\\n...",
    "sources": [{"url": "...", "title": "..."}],
    "confidence": "high|medium|low"
  },
  "behavioralStyle": {
    "content": "## Negotiation Approach\\n...\\n## Courtroom Demeanor\\n...\\n## Conflict Style\\n...\\n## Decision-Making\\n...",
    "sources": [{"url": "...", "title": "..."}],
    "confidence": "high|medium|low"
  },
  "communicationProfile": {
    "content": "## Writing Style\\n...\\n## Tone & Formality\\n...\\n## Public Statements\\n...\\n## Social Media Voice\\n...",
    "sources": [{"url": "...", "title": "..."}],
    "confidence": "high|medium|low"
  },
  "politicalProfile": {
    "content": "## Political Donations\\n...\\n## Public Stances\\n...\\n## Judicial Philosophy\\n...\\n## Social Views\\n...",
    "sources": [{"url": "...", "title": "..."}],
    "confidence": "high|medium|low"
  },
  "socialMediaPresence": {
    "content": "## LinkedIn\\n...\\n## Twitter/X\\n...\\n## Facebook\\n...\\n## Overall Digital Footprint\\n...",
    "sources": [{"url": "...", "title": "..."}],
    "confidence": "high|medium|low"
  },
  "professionalReputation": {
    "content": "## Bar Standing\\n...\\n## Peer Reviews & Ratings\\n...\\n## Awards & Recognition\\n...\\n## Client Reviews\\n...",
    "sources": [{"url": "...", "title": "..."}],
    "confidence": "high|medium|low"
  },
  "redFlags": {
    "content": "## Disciplinary History\\n...\\n## Sanctions\\n...\\n## Malpractice\\n...\\n## Ethical Concerns\\n...",
    "sources": [{"url": "...", "title": "..."}],
    "confidence": "high|medium|low"
  },
  "strategicRecommendations": {
    "content": "## Communication Strategy\\n...\\n## Negotiation Approach\\n...\\n## Potential Leverage Points\\n...\\n## Things to Avoid\\n...\\n## Overall Assessment\\n...",
    "sources": [],
    "confidence": "high|medium|low"
  }
}

Guidelines for content:
- Use markdown headers (##, ###) to organize each section
- Be specific — include dates, case numbers, amounts where found
- If information is not found after thorough searching, say "No public information found" rather than speculating
- Confidence levels: "high" = multiple corroborating sources, "medium" = 1-2 sources, "low" = inference only
- For strategicRecommendations, synthesize ALL findings into actionable advice for an opposing litigator
- Every factual claim must have a corresponding source URL
- Keep content substantive — each section should be at least 2-3 paragraphs`
}

/**
 * Builds the user message for the main search.
 */
export function buildSearchUserMessage(input) {
  const parts = []

  if (input.type === 'name') {
    parts.push(`Research this attorney and produce a complete dossier:`)
    parts.push(`Full Name: ${input.name}`)
    if (input.jurisdiction) parts.push(`Jurisdiction/State: ${input.jurisdiction}`)
    if (input.firmName) parts.push(`Firm (if known): ${input.firmName}`)
  } else if (input.type === 'bar') {
    parts.push(`Research this attorney and produce a complete dossier:`)
    parts.push(`Bar Number: ${input.barNumber}`)
    parts.push(`State Bar: ${input.jurisdiction}`)
  } else if (input.type === 'urls') {
    parts.push(`Research this attorney using the following URLs as starting points, then expand your research further:`)
    parts.push(`Seed URLs:\n${input.urls}`)
    if (input.name) parts.push(`Known Name: ${input.name}`)
    if (input.jurisdiction) parts.push(`Jurisdiction: ${input.jurisdiction}`)
  }

  parts.push(`\nPerform comprehensive web searches and return ONLY the JSON dossier object as specified. No other text.`)

  return parts.join('\n')
}

/**
 * Builds the prompt for a deep-dive re-search on a single section.
 */
export function buildDeepDivePrompt(sectionKey, subjectName, existingContent, additionalUrls) {
  const section = DOSSIER_SECTIONS.find(s => s.key === sectionKey)
  return {
    system: `You are a legal intelligence analyst. Perform deep research on a specific aspect of an attorney's profile and return ONLY valid JSON with this structure: {"content": "markdown content here", "sources": [{"url": "...", "title": "..."}], "confidence": "high|medium|low"}`,
    user: `Do a deep dive on the "${section?.title}" section for attorney: ${subjectName}

Focus: ${section?.description}
Search focus: ${section?.searchFocus}

${additionalUrls ? `Additional URLs to analyze:\n${additionalUrls}\n` : ''}
${existingContent ? `Existing content to expand upon:\n${existingContent}\n` : ''}

Perform 5-8 targeted searches specifically about this section. Return ONLY the JSON object.`,
  }
}

/**
 * Builds a synthesis prompt for the Serper fallback path
 * (when the AI model doesn't have native web search).
 */
export function buildSynthesisPrompt(subjectName, searchResults) {
  const resultsText = searchResults
    .map(r => `[${r.category.toUpperCase()}]\nQuery: ${r.query}\nResults:\n${r.results.map(i => `- ${i.title}: ${i.snippet} (${i.link})`).join('\n')}`)
    .join('\n\n')

  return {
    system: buildSystemPrompt(),
    user: `Based on the following web search results, compile a complete attorney dossier for: ${subjectName}

Search Results:
${resultsText}

Return ONLY the JSON dossier object. No other text.`,
  }
}
