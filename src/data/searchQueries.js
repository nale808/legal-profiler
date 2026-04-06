/**
 * Template search queries used by the Serper fallback path
 * (for custom/local models without native web search).
 */
export function buildSearchQueries(name, jurisdiction) {
  const j = jurisdiction ? ` ${jurisdiction}` : ''
  return [
    { category: 'identity',    query: `"${name}" attorney${j}` },
    { category: 'bar',         query: `"${name}" attorney bar admission${j}` },
    { category: 'bar',         query: `"${name}" attorney disciplinary${j}` },
    { category: 'linkedin',    query: `"${name}" attorney site:linkedin.com` },
    { category: 'twitter',     query: `"${name}" attorney site:twitter.com OR site:x.com` },
    { category: 'facebook',    query: `"${name}" attorney site:facebook.com` },
    { category: 'ratings',     query: `"${name}" attorney avvo rating` },
    { category: 'ratings',     query: `"${name}" attorney martindale-hubbell` },
    { category: 'political',   query: `"${name}" FEC political donations attorney` },
    { category: 'political',   query: `"${name}" attorney political campaign contribution` },
    { category: 'cases',       query: `"${name}" attorney court case filing${j}` },
    { category: 'news',        query: `"${name}" attorney${j} news` },
    { category: 'publications', query: `"${name}" attorney article publication law review` },
  ]
}
