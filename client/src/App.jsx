import { useState, useRef, useEffect } from 'react'
import { api, readError } from './api'
import { c, mono, sans } from './theme'
import { isRefusal, buildParts, collectSources } from './lib/citations'
import { FileIcon } from './components/icons'
import UploadZone from './components/UploadZone'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'

export default function App() {
  const [messages, setMessages] = useState([])
  const [docInfo, setDocInfo] = useState(null)
  const [indexing, setIndexing] = useState(false)
  const [querying, setQuerying] = useState(false)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)
  const convRef = useRef(null)

  // Connection check: hit a cheap backend route once on load. If it answers,
  // we're connected. (Also confirms the proxy is wired correctly.)
  useEffect(() => {
    api.get('/chunks/count')
      .then(() => setConnected(true))
      .catch(() => setConnected(false))
  }, [])

  // Auto-scroll the conversation to the bottom whenever it grows.
  useEffect(() => {
    const el = convRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, querying])

  // --- INGEST: upload -> chunk -> embed -> store (happens on the backend) ---
  async function handleUpload(file) {
    setError('')
    setIndexing(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/ingest', form)
      setDocInfo({ filename: data.filename, pages: data.pages, chunks: data.chunks })
      setConnected(true)
    } catch (err) {
      setError(readError(err, 'upload failed — is the backend running?'))
    } finally {
      setIndexing(false)
    }
  }

  // --- QUERY: embed question -> retrieve -> grounded answer ---
  async function handleAsk(question) {
    const q = (question || '').trim()
    if (!q || querying) return

    setMessages((m) => [...m, { role: 'user', text: q }])
    setQuerying(true)
    setError('')

    try {
      const { data } = await api.post('/query', { question: q })
      const answer = data.answer ?? ''

      if (isRefusal(answer)) {
        // grounding held — the doc couldn't answer, so we say so
        setMessages((m) => [...m, { role: 'refusal', text: answer }])
      } else {
        const parts = buildParts(answer, data.results || [])
        const sources = collectSources(parts)
        setMessages((m) => [...m, { role: 'answer', parts, sources }])
      }
    } catch (err) {
      setError(readError(err, 'request failed — backend error. try again.'))
    } finally {
      setQuerying(false)
    }
  }

  return (
    <div style={{
      height: '100vh', background: c.bg, color: c.text, fontFamily: sans,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 640, height: '100%',
        display: 'flex', flexDirection: 'column', padding: '0 20px',
      }}>

        {/* HEADER */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '22px 0 16px 0' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: c.lime,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FileIcon />
          </div>
          <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: c.textBright }}>
            rag.doc
          </span>
          <div style={{ flex: 1 }} />
          <span style={{
            fontFamily: mono, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 11px', borderRadius: 999, border: `1px solid ${c.border}`,
            background: c.surface, color: connected ? c.lime : c.muted,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: connected ? c.lime : c.muted,
            }} />
            {connected ? 'connected' : 'offline'}
          </span>
        </header>

        {/* UPLOAD */}
        <UploadZone indexing={indexing} docInfo={docInfo} onUpload={handleUpload} />

        {/* CONVERSATION (scrolls) */}
        <div ref={convRef} style={{
          flex: 1, overflowY: 'auto', padding: '12px 2px 8px 2px',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <MessageList
            messages={messages}
            querying={querying}
            error={error}
            hasDoc={!!docInfo}
            onAsk={handleAsk}
          />
        </div>

        {/* INPUT */}
        <ChatInput disabled={querying} onSend={handleAsk} />
      </div>
    </div>
  )
}
