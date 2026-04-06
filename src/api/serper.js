const SERPER_URL = 'https://google.serper.dev/search'

/**
 * Runs a single Google search via Serper.dev API.
 */
export async function searchGoogle(query, apiKey) {
  const response = await fetch(SERPER_URL, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 8 }),
  })

  if (!response.ok) {
    throw new Error(`Serper API error ${response.status}`)
  }

  const data = await response.json()
  return (data.organic || []).map(r => ({
    title: r.title,
    link: r.link,
    snippet: r.snippet || '',
  }))
}

/**
 * Runs multiple queries in parallel (max 3 concurrent).
 */
export async function runSearchBatch(queries, apiKey, onProgress) {
  const results = []
  const CONCURRENCY = 3

  for (let i = 0; i < queries.length; i += CONCURRENCY) {
    const batch = queries.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.allSettled(
      batch.map(async (q) => {
        onProgress(`Searching: "${q.query}"`, 'search')
        const res = await searchGoogle(q.query, apiKey)
        return { category: q.category, query: q.query, results: res }
      })
    )
    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(r.value)
    }
  }

  return results
}
