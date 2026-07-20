const OLLAMA_URL = process.env.OLLAMA_URL;
const EMBED_MODEL = process.env.EMBED_MODEL;
import { config } from '../config.js';

// nomic-embed-text was trained with task prefixes. When config.usePrefixes is on,
// documents get "search_document: " and queries get "search_query: ".
// kind is 'document' (default) or 'query'.
export async function embed(text, kind = 'document') {
  let input = text;
  if (config.usePrefixes) {
    input = (kind === 'query' ? 'search_query: ' : 'search_document: ') + text;
  }

  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: input }),
  });

  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);

  const data = await res.json();
  if (!Array.isArray(data.embedding)) throw new Error('No embedding in Ollama response');

  return data.embedding;
}