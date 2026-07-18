// Palette — pulled verbatim from the approved dark mockup.
// One accent (lime), used ONLY on the logo mark, the send button, and citations.
export const c = {
  bg: '#14131a',          // page background
  surface: '#1c1b24',     // cards, input bar
  surfaceUser: '#26242f', // the user's own question bubble
  border: '#2b2935',      // hairline borders
  text: '#e4e2dc',        // answer body text
  textBright: '#f4f3ee',  // logo, user text
  muted: '#7d7a8c',       // secondary / labels
  faint: '#4a4856',       // faintest hints, placeholders
  lime: '#c4f042',        // THE accent
  limeBright: '#d4ff62',  // hover
  error: '#f0a0a0',       // error text
}

export const mono = "'JetBrains Mono', ui-monospace, monospace"
export const sans = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

// The backend returns this EXACT string when the document can't answer.
// The whole grounding feature hinges on detecting it, so it lives in one place.
export const REFUSAL = "I don't know based on the provided document."
