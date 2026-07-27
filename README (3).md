# rag.doc — document Q&A with retrieval-augmented generation

A document question-answering app built on RAG, from scratch. Upload a PDF, ask
questions, get answers grounded **only** in the document — with page citations,
and an honest "I don't know" when the document doesn't contain the answer.

The retrieval pipeline is hand-rolled: no LangChain, no LlamaIndex, no vector-DB
SDK. Text extraction, chunking, embeddings, cosine-similarity search, and
grounded generation are each written directly, because the point of the project
was to understand every piece rather than wire a framework blindly.

---

## What it does

- **Ingest** a PDF → extract text → chunk it → embed each chunk → store in MongoDB.
- **Query** a question → embed the question → retrieve the most similar chunks →
  ask an LLM to answer *using only those chunks*, with inline `[n]` citations.
- **Refuse** when the document can't answer — the LLM returns a fixed
  "I don't know based on the provided document" string, and the UI renders it
  distinctly from a real answer.

---

## Architecture

Two separate flows share one embedding model. This split is the core mental
model of RAG:

```
INGEST (once per document)
  PDF ──▶ extract text ──▶ chunk (800 chars, 100 overlap, + page number)
      ──▶ embed each chunk (nomic-embed-text, 768-dim)
      ──▶ store {content, page, embedding} in MongoDB

QUERY (once per question)
  question ──▶ embed the question (same model, 768-dim)
           ──▶ cosine-similarity vs every stored chunk ──▶ top-k
           ──▶ prompt LLM: "answer only from this context, cite, else refuse"
           ──▶ grounded answer + page citations
```

Documents are embedded **once**, at ingest. Only the question is embedded at
query time. The same embedding model must be used on both sides — mixing models
(e.g. a 768-dim and a 1536-dim model) makes cosine similarity undefined, not
merely inaccurate.

---

## Stack

- **Backend:** Node / Express, MongoDB (Mongoose)
- **Embeddings:** `nomic-embed-text` via Ollama — local, free, called over HTTP
- **Generation:** Google Gemini (free tier)
- **Frontend:** Vite + React, one axios instance, no UI framework
- **PDF parsing:** `pdf-parse` v2
- No RAG framework. The retrieval loop is the code in `server/lib`.

---

## Repository layout

```
rag-doc-qa/
├── server/
│   ├── server.js              Express app, Mongo connect, health check
│   ├── config.js              tuning knobs (topK, usePrefixes)
│   ├── routes/
│   │   ├── ingest.js          POST /api/ingest  — the ingest flow
│   │   ├── query.js           POST /api/query   — the query flow
│   │   └── eval.js            POST /api/eval     — the tuning harness
│   ├── lib/
│   │   ├── chunk.js           page-aware chunking with overlap
│   │   ├── embed.js           Ollama embeddings (15 lines, no SDK)
│   │   ├── similarity.js      cosine similarity, by hand
│   │   └── generate.js        Gemini grounded generation + refusal string
│   ├── models/
│   │   └── Chunk.js           {content, page, chunkIndex, embedding[]}
│   └── eval/
│       └── questions.js       the fixed eval set (the "measuring tape")
└── client/
    └── src/                   React chat UI (see client/README.md)
```

---

## Running it

You need **Ollama**, **MongoDB** (Atlas or local), and a **Gemini API key**.

### 1. Ollama + the embedding model

```bash
ollama pull nomic-embed-text
ollama serve            # if not already running
# sanity check — should return a 768-length vector:
curl http://localhost:11434/api/embeddings \
  -d '{"model":"nomic-embed-text","prompt":"hello"}'
```

### 2. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5002
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/rag-doc-qa?retryWrites=true&w=majority
GEMINI_API_KEY=<your key>
GEMINI_MODEL=gemini-2.5-flash        # or whatever your key currently serves
OLLAMA_URL=http://localhost:11434
EMBED_MODEL=nomic-embed-text
```

> The Gemini model name is set here on purpose — free-tier model availability
> changes, so if you get a 404, list what your key can reach with:
> `curl "https://generativelanguage.googleapis.com/v1beta/models?key=<key>"`

```bash
npm run dev              # starts on http://localhost:5002
```

Confirm: open http://localhost:5002/health — it should report
`{"status":"ok","mongo":"connected","db":"rag-doc-qa"}`.

### 3. Frontend

```bash
cd client
npm install
npm run dev              # http://localhost:5173, proxies /api to the backend
```

---

## API

| Method | Route | Body | Returns |
|---|---|---|---|
| POST | `/api/ingest` | multipart `file` (PDF) | `{ docId, filename, pages, chunks }` |
| POST | `/api/query` | `{ question }` | `{ question, answer, results:[{score,page,chunkIndex,preview}] }` |
| GET | `/api/chunks/count` | — | `{ count }` |
| DELETE | `/api/chunks` | — | `{ deleted }` |
| POST | `/api/eval` | `{ mode: "retrieval" \| "full" }` | scorecard |

The `answer` string carries inline `[1]`, `[2]` markers. `[n]` maps to
`results[n-1]` — that's how the UI resolves a citation to its page number.

Quick end-to-end test:

```bash
curl -F "file=@samples/your.pdf" http://localhost:5002/api/ingest
curl -X POST http://localhost:5002/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"<something your doc answers>"}'
```

---

## Grounding — the point of the project

Retrieval always returns *something*. There is no built-in notion of "no match":
it ranks every chunk by cosine similarity and hands back the top-k regardless of
the question. In testing, an in-domain question and a completely out-of-domain
one scored within ~0.06 of each other — meaning **similarity score alone cannot
gate relevance.**

So what stops the system from confidently answering a question the document
doesn't cover? The prompt. `generate.js` instructs the model to answer **only**
from the provided context, cite it, and otherwise return a fixed refusal string.
That instruction — not the retrieval score — is what separates a grounded RAG
system from a chatbot with a document stapled on. The UI then renders the
refusal visibly differently from an answer, making the grounding observable.

---

## Retrieval tuning study (the interesting part)

Rather than assume a config was good, retrieval quality was measured against a
fixed eval set (`eval/questions.js`) scored by page-hit: did the top retrieved
chunk come from the expected page? One variable changed per run.

| Config | Score |
|---|---|
| 800 / 100 chunks, no task prefix | **5/6** |
| 800 / 100, nomic `search_*` prefixes | 4/6 |
| 500 / 100, prefixes | 4/6 |

**Findings:**

- **Task prefixes are a tradeoff, not a free win.** nomic-embed-text's
  `search_document:` / `search_query:` prefixes raised similarity scores across
  the board and fixed the hardest retrieval case — but compressed the score
  distribution, destabilising near-tie rankings and breaking two previously
  correct queries. Net accuracy dropped.
- **Smaller chunks made it worse.** On a definition-dense document, 500-char
  chunks split terms from their definitions, letting unrelated fragments outrank
  the correct chunk. Higher scores, worse ranking.
- **The simplest config won.** Both "improvements" hurt. Higher similarity
  scores are not better retrieval — ranking and separation matter more than
  absolute magnitude.

On a small, homogeneous corpus the baseline is best; prefixes and fine-grained
chunking should pay off on larger, more varied documents. Full detail in
[`PHASE7-FINDINGS.md`](./PHASE7-FINDINGS.md).

---

## Design notes / decisions

- **Cosine similarity, not distance** — measures the angle between vectors, so a
  long chunk and a short chunk on the same topic still match. Written by hand in
  `lib/similarity.js` (~10 lines).
- **Brute-force linear scan** — `/query` loads every chunk and scores it in a
  loop. Instant at this scale; it would not survive 100k chunks. That pressure is
  exactly what motivates a real vector index (e.g. Atlas Vector Search) — a
  known next step, understood rather than cargo-culted.
- **Sequential embedding at ingest** — one chunk at a time, on purpose, so the
  pipeline is legible while learning. Parallelising is a later optimisation.
- **Page metadata captured at chunk time** — you can't recover a chunk's source
  page after the fact, so it's tagged on the way through. This is what makes
  citations possible.

## Known limitations

- Retrieval is a full scan (no ANN index yet).
- Single-document focus; no multi-doc management.
- Chunk size currently lives in `lib/chunk.js`, not fully unified with
  `config.js` — noted for cleanup.
- Free-tier Gemini is rate-limited (5 req/min), which is why the eval harness
  scores retrieval without the LLM and only calls it for refusal checks.

---

## Why this project exists

A deliberate bridge project: learn the retrieval / embeddings / vector-search
stack from scratch on a simple document Q&A app, so a larger flagship (a RAG
system over code repositories) becomes "apply what I already built" rather than
"learn everything at once." The value was in building — and measuring — every
piece by hand.
```
