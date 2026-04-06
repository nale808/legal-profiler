import { buildSystemPrompt, buildSearchUserMessage, buildSynthesisPrompt } from './prompts'
import { streamAnthropicSearch } from './anthropic'
import { streamOpenAISearch } from './openai'
import { runSearchBatch } from './serper'
import { buildSearchQueries } from '../data/searchQueries'

/**
 * Parses JSON from an AI response, stripping markdown fences if needed.
 */
function parseJSON(text) {
  let cleaned = text.trim()
  // Strip markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  return JSON.parse(cleaned)
}

/**
 * Maps a parsed dossier JSON object into profile section updates.
 */
function applyDossierToProfile(parsed, profileId, updateSection, setSubjectName) {
  const sectionKeys = [
    'executiveSummary', 'professionalBackground', 'behavioralStyle',
    'communicationProfile', 'politicalProfile', 'socialMediaPresence',
    'professionalReputation', 'redFlags', 'strategicRecommendations',
  ]

  if (parsed.subjectName) {
    setSubjectName(profileId, parsed.subjectName)
  }

  for (const key of sectionKeys) {
    if (parsed[key]) {
      updateSection(profileId, key, parsed[key].content || '', parsed[key].sources || [])
    }
  }
}

/**
 * Main search orchestrator. Picks the right provider and runs the search.
 *
 * @param {object} options
 * @param {object} options.input - Search input (type, name, jurisdiction, etc.)
 * @param {object} options.settings - From useSettingsStore
 * @param {object} options.profileId - The active profile ID to update
 * @param {object} options.actions - { updateSection, setSubjectName, addProgress, completeSearch, failSearch }
 * @param {AbortSignal} options.signal
 */
export async function runSearch({ input, settings, profileId, actions, signal }) {
  const { provider, apiKeys, models, customEndpoint } = settings
  const { updateSection, setSubjectName, addProgress, completeSearch, failSearch } = actions

  const systemPrompt = buildSystemPrompt()
  const userMessage = buildSearchUserMessage(input)

  addProgress('Starting research...', 'info')

  try {
    let rawText = ''

    // ── Path A: Anthropic (native web search) ────────────────────────
    if (provider === 'anthropic') {
      addProgress('Connecting to Claude with web search...', 'info')
      rawText = await streamAnthropicSearch({
        apiKey: apiKeys.anthropic,
        model: models.anthropic,
        systemPrompt,
        userMessage,
        onProgress: addProgress,
        signal,
      })
    }

    // ── Path B: OpenAI (native web search) ───────────────────────────
    else if (provider === 'openai') {
      addProgress('Connecting to GPT with web search...', 'info')
      rawText = await streamOpenAISearch({
        apiKey: apiKeys.openai,
        model: models.openai,
        systemPrompt,
        userMessage,
        onProgress: addProgress,
        signal,
      })
    }

    // ── Path C: Custom/local model + Serper fallback ─────────────────
    else if (provider === 'custom') {
      if (!apiKeys.serper) {
        throw new Error('Serper.dev API key required for custom models without native web search.')
      }

      addProgress('Running web searches via Serper.dev...', 'info')
      const queries = buildSearchQueries(input.name || '', input.jurisdiction || '')
      const searchResults = await runSearchBatch(queries, apiKeys.serper, addProgress)

      addProgress('Synthesizing research with AI...', 'info')
      const { system, user } = buildSynthesisPrompt(
        input.name || input.barNumber || 'Unknown',
        searchResults
      )

      // Call custom endpoint (OpenAI-compatible format assumed)
      const response = await fetch(customEndpoint, {
        method: 'POST',
        signal,
        headers: {
          'Authorization': apiKeys.custom ? `Bearer ${apiKeys.custom}` : undefined,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          max_tokens: 16000,
        }),
      })

      if (!response.ok) throw new Error(`Custom model API error ${response.status}`)
      const data = await response.json()
      rawText = data.choices?.[0]?.message?.content || ''
    }

    if (!rawText) throw new Error('No content returned from AI model.')

    addProgress('Parsing dossier...', 'info')

    let parsed
    try {
      parsed = parseJSON(rawText)
    } catch (e) {
      // Second attempt: find JSON object in the text
      const match = rawText.match(/\{[\s\S]*\}/)
      if (match) {
        parsed = JSON.parse(match[0])
      } else {
        throw new Error('Could not parse AI response as JSON. Try again.')
      }
    }

    applyDossierToProfile(parsed, profileId, updateSection, setSubjectName)
    addProgress('Research complete.', 'success')
    completeSearch()

  } catch (err) {
    if (err.name === 'AbortError') {
      addProgress('Search cancelled.', 'info')
      return
    }
    failSearch(err.message)
  }
}
