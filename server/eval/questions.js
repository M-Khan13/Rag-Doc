// The eval set — the "measuring tape" for retrieval quality.
//
// Each entry declares what a CORRECT result looks like, so scoring is automatic
// (no human eyeballing 8 answers every run). Two kinds of expectation:
//
//   expectPage: N   -> an answerable question; the top retrieved chunk should
//                      come from page N. (Pages observed from real retrieval
//                      output during the build, not guessed.)
//   expectRefusal  -> an out-of-domain question; the system should refuse.
//
// When you change chunk size / overlap / top-k / prefixes and re-run, this file
// stays fixed. That's the whole point: a stable ruler you measure changes against.

export const evalSet = [
  // --- answerable, single clean concept (page 1) ---
  { q: 'what is bcrypt', expectPage: 1 },
  { q: 'what does RBAC mean', expectPage: 1 },
  { q: 'what is a JWT', expectPage: 1 },

  // --- answerable, but the answer is split across chunks (the hard case) ---
  { q: 'what is the difference between authentication and authorization', expectPage: 1 },

  // --- answerable, specific mechanic on a later page ---
  { q: 'how does the order state machine work', expectPage: 2 },

  // --- answerable, "topic present but detail absent" (page 3 lists gaps) ---
  { q: 'what has not been built yet', expectPage: 3 },

  // --- out of domain: must refuse ---
  { q: 'what is the capital of France', expectRefusal: true },
  { q: 'how do i center a div in css', expectRefusal: true },
]
