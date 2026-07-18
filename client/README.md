# rag.doc — frontend

Minimal React chat UI over the RAG backend. Upload a PDF, ask questions, get
grounded answers with page citations — or a visibly distinct "I don't know" when
the document can't answer.

## Run

The backend must be running on **http://localhost:5002** first.

```bash
cd client
npm install
npm run dev
```

Open the printed URL (http://localhost:5173). Vite proxies `/api` and `/health`
to the backend on 5002 — see `vite.config.js`.

## What talks to what

- `POST /api/ingest` (multipart `file`) → `{ docId, filename, pages, chunks }`
- `POST /api/query` (`{ question }`) → `{ question, answer, results:[{score,page,chunkIndex,preview}] }`
- `GET /api/chunks/count` → used once on load for the connection indicator

## The one thing that matters

`src/lib/citations.js` detects the backend's exact refusal string
(`"I don't know based on the provided document."`) and the UI renders it
differently from a real answer — dashed, muted, no citation pills. That contrast
is the grounding feature made visible. `src/theme.js` holds that string in one
place.

## Files

```
src/
  App.jsx            state owner; ingest + query calls
  api.js             axios instance (baseURL /api) + error reader
  theme.js           palette, fonts, the refusal string
  lib/citations.js   refusal check, [n]->page mapping, source dedup
  components/
    UploadZone.jsx   upload / indexing / confirmed states
    MessageList.jsx  bubbles, citations, refusal, thinking, error, empty
    ChatInput.jsx    input + send, disabled while querying
    icons.jsx        inline SVG icons
```
