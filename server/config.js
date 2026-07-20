// Phase 7 tuning knobs — the ONLY place these live.
//
// The loop: change ONE value here -> re-ingest (DELETE /chunks, POST /ingest)
//           -> POST /eval -> compare the score to your last run. One change at a
//           time, or you won't know what moved the number.
//
// Which knobs require a re-ingest vs. take effect immediately:
//   chunkSize / chunkOverlap / usePrefixes  -> change embeddings -> RE-INGEST
//   topK                                    -> query-time only  -> no re-ingest
//
// The prefix knob is the big one. nomic-embed-text was trained with task
// prefixes: documents embedded as "search_document: <text>" and queries as
// "search_query: <text>". Skipping them (what we did in phases 1-6) still works
// but leaves quality on the table. Flipping this to true is the single change
// most likely to widen the bcrypt-vs-sourdough gap.

export const config = {
  chunkSize: 500,
  chunkOverlap: 100,
  topK: 4,
  usePrefixes: true, // start false = current baseline; flip to true and compare
}
