import { useState } from 'react'
import { c, mono, sans } from '../theme'
import { MessageIcon, ArrowUpIcon } from './icons'

export default function ChatInput({ disabled, onSend }) {
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0 && !disabled

  function submit() {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', margin: '8px 0 20px 0',
      border: `1px solid ${c.border}`, borderRadius: 14, background: c.surface,
    }}>
      <span style={{ flexShrink: 0 }}><MessageIcon /></span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder="ask about your document…"
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: c.textBright, fontFamily: sans, fontSize: 14.5,
        }}
      />
      <button
        onClick={submit}
        disabled={!canSend}
        style={{
          width: 32, height: 32, borderRadius: 8, border: 'none',
          background: canSend ? c.lime : c.border,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: canSend ? 'pointer' : 'default', flexShrink: 0,
        }}
      >
        <ArrowUpIcon color={canSend ? '#14131a' : c.muted} />
      </button>
    </div>
  )
}
