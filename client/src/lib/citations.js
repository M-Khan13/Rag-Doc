import { REFUSAL } from '../theme'

// Is this answer the backend's grounded refusal? Exact match — no fuzzy logic,
// because the backend emits one fixed string and we want to be certain.
export function isRefusal(answer) {
  return (answer || '').trim() === REFUSAL
}

// Split an answer string into an ordered list of parts: plain text and citations.
//
// The answer contains inline markers like "[1]" and "[2]". A marker "[n]" refers
// to results[n-1] (the backend labels context 1-indexed, in results order).
//
// Two deliberate behaviours:
//  - A resolved marker becomes a { type:'cite', page } part -> renders as a pill.
//  - An UNRESOLVED marker (model cited [5] but only 4 results exist) is kept as
//    plain text so we render the raw "[5]" instead of crashing or hiding it.
export function buildParts(answer, results) {
  // The capturing group in split() keeps the delimiters, so "[1]" survives as
  // its own array element rather than being discarded.
  const tokens = (answer || '').split(/(\[\d+\])/g)

  return tokens.filter(Boolean).map((tok) => {
    const m = tok.match(/^\[(\d+)\]$/)
    if (!m) return { type: 'text', text: tok }

    const idx = parseInt(m[1], 10) - 1 // 1-indexed -> 0-indexed
    const r = results[idx]
    return r
      ? { type: 'cite', label: tok, page: r.page }
      : { type: 'text', text: tok } // unresolved -> show the raw marker
  })
}

// Collect unique page numbers from the cite parts, in first-appearance order.
// This drives the "sources: p.1 p.3" pills under an answer.
export function collectSources(parts) {
  const seen = new Set()
  const pages = []
  for (const p of parts) {
    if (p.type === 'cite' && !seen.has(p.page)) {
      seen.add(p.page)
      pages.push(p.page)
    }
  }
  return pages
}
