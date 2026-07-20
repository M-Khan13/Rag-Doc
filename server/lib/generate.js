const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
  export const REFUSAL_STRING = "I don't know based on the provided document.";

function buildPrompt(question, chunks) {
  const context = chunks
    .map((c, i) => `[${i + 1}] (page ${c.page})\n${c.content}`)
    .join('\n\n---\n\n');

  return `You are a document Q&A assistant. Answer the question using ONLY the context below.

Rules:
- Use only information in the context. Do not use outside knowledge.
- If the context does not contain the answer, reply exactly: "I don't know based on the provided document."
- Cite the source of each claim using the [number] labels from the context.
- Be concise.

Context:
${context}

Question: ${question}

Answer:`;
}

export async function generate(question, chunks) {
  const prompt = buildPrompt(question, chunks);

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!answer) throw new Error('No answer in Gemini response');

  return answer.trim();
}