const API_URL = 'https://api.anthropic.com/v1/messages'

/**
 * Streams a research request to Claude with web search enabled.
 * Calls onProgress with status updates, resolves with the final JSON string.
 */
export async function streamAnthropicSearch({ apiKey, model, systemPrompt, userMessage, onProgress, signal }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 16000,
      stream: true,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 20 }],
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error ${response.status}: ${err}`)
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
    buffer = lines.pop() // Keep incomplete line

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

      // Emit progress for web search queries
      if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
        if (event.content_block.name === 'web_search') {
          onProgress('Initiating web search...', 'search')
        }
      }

      if (event.type === 'content_block_delta') {
        const delta = event.delta
        if (delta?.type === 'input_json_delta' && delta.partial_json) {
          // Tool input (search query)
          onProgress(`Searching: ${delta.partial_json}`, 'search')
        }
        if (delta?.type === 'text_delta' && delta.text) {
          fullText += delta.text
        }
      }

      if (event.type === 'tool_result') {
        onProgress('Processing search results...', 'info')
      }
    }
  }

  return fullText
}

/**
 * Non-streaming call for deep-dive section research.
 */
export async function callAnthropic({ apiKey, model, systemPrompt, userMessage, signal }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      'x-api-key': apiKey,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 10 }],
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const textBlock = data.content?.find(b => b.type === 'text')
  return textBlock?.text || ''
}
