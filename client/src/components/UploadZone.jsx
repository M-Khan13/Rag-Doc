import { c, mono } from '../theme'
import { UploadIcon, CheckIcon } from './icons'

// Three states, mutually exclusive:
//   indexing  -> spinner + "indexing…"
//   docInfo   -> confirmed pill "✓ file · N chunks · click to replace"
//   otherwise -> dashed "drop pdf or click to upload"
export default function UploadZone({ indexing, docInfo, onUpload }) {
  function handleChange(e) {
    const file = e.target.files && e.target.files[0]
    if (file) onUpload(file)
    e.target.value = '' // allow re-selecting the same file later
  }

  if (indexing) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', border: `1px solid ${c.border}`,
        borderRadius: 12, background: c.surface, marginBottom: 8,
      }}>
        <span style={{
          width: 16, height: 16, borderRadius: '50%',
          border: `2px solid ${c.border}`, borderTopColor: c.lime,
          animation: 'spin 0.7s linear infinite', flexShrink: 0,
        }} />
        <span style={{ fontFamily: mono, fontSize: 13, color: c.muted }}>
          indexing… embedding chunks
        </span>
      </div>
    )
  }

  if (docInfo) {
    return (
      <label style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 16px', border: `1px solid ${c.border}`,
        borderRadius: 12, background: c.surface, marginBottom: 8, cursor: 'pointer',
      }}>
        <input type="file" accept="application/pdf" onChange={handleChange} style={{ display: 'none' }} />
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: mono, fontSize: 13, padding: '4px 10px', borderRadius: 999,
          background: 'rgba(196,240,66,0.1)', border: '1px solid rgba(196,240,66,0.35)', color: c.lime,
        }}>
          <CheckIcon />
          {docInfo.filename} · {docInfo.chunks} chunks
        </span>
        <span style={{ fontFamily: mono, fontSize: 12, color: c.faint }}>
          · {docInfo.pages} pages · click to replace
        </span>
      </label>
    )
  }

  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', border: `1px dashed ${c.border}`,
      borderRadius: 12, background: 'transparent', marginBottom: 8, cursor: 'pointer',
    }}>
      <input type="file" accept="application/pdf" onChange={handleChange} style={{ display: 'none' }} />
      <UploadIcon />
      <span style={{ fontSize: 14, color: c.muted }}>drop pdf or click to upload</span>
    </label>
  )
}
