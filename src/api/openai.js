const API_URL = 'https://api.openai.com/v1/responses'

/**
 * Streams a research request to OpenAI with web search enabled.
 */
export async function streamOpenAISearch({ apiKey, model, systemPrompt, userMessage, onProgress, signal }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: true,
      tools: [{ type: 'web_search_preview' }],
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_output_tokens: 16000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${err}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue

      let event
      try {
        event = JSON.parse(data)
      } catch {
        continue
      }

      if (event.type === 'response.web_search_call.searching') {
        onProgress(`Searching: ${event.query || '...'}`, 'search')
      }

      if (event.type === 'response.output_text.delta' && event.delta) {
        fullText += event.delta
      }
    }
  }

  return fullText
}

/**
 * Non-streaming for deep-dive calls.
 */
export async function callOpenAI({ apiKey, model, systemPrompt, userMessage, signal }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      tools: [{ type: 'web_search_preview' }],
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_output_tokens: 8000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const textItem = data.output?.find(o => o.type === 'message')
  const textContent = textItem?.content?.find(c => c.type === 'output_text')
  return textContent?.text || ''
}
