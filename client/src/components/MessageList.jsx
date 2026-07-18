import { c, mono } from '../theme'
import { BanIcon } from './icons'

const EXAMPLES = ['what is bcrypt', 'how do i bake sourdough']

export default function MessageList({ messages, querying, error, hasDoc, onAsk }) {
  const showEmpty = messages.length === 0 && !querying

  return (
    <>
      {showEmpty && (
        <div style={{
          margin: 'auto', textAlign: 'center', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: 18,
        }}>
          <p style={{ fontSize: 14, color: c.faint, margin: 0 }}>
            ask something about your document
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 11, color: c.faint, letterSpacing: '0.05em' }}>
              try
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => onAsk(ex)}
                  style={{
                    fontFamily: mono, fontSize: 12, color: c.muted,
                    background: c.surface, border: `1px solid ${c.border}`,
                    borderRadius: 999, padding: '6px 12px', cursor: 'pointer',
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {messages.map((m, i) => {
        if (m.role === 'user') return <UserBubble key={i} text={m.text} />
        if (m.role === 'answer') return <AnswerBubble key={i} parts={m.parts} sources={m.sources} />
        if (m.role === 'refusal') return <RefusalBubble key={i} text={m.text} />
        return null
      })}

      {querying && <Thinking />}
      {error && <ErrorLine text={error} />}
    </>
  )
}

function UserBubble({ text }) {
  return (
    <div style={{
      alignSelf: 'flex-end', maxWidth: '82%',
      background: c.surfaceUser, color: c.textBright,
      fontSize: 14.5, lineHeight: 1.5, padding: '11px 15px',
      borderRadius: '14px 14px 4px 14px',
    }}>
      {text}
    </div>
  )
}

// A grounded answer: solid card, inline lime citation pills, then source pills.
function AnswerBubble({ parts, sources }) {
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '88%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        background: c.surface, border: `1px solid ${c.border}`,
        borderRadius: '14px 14px 14px 4px', padding: '14px 16px',
        fontSize: 14.5, lineHeight: 1.65, color: c.text,
      }}>
        {parts.map((p, i) =>
          p.type === 'cite' ? (
            <span key={i} style={{
              fontFamily: mono, fontSize: 11, fontWeight: 600, color: c.lime,
              background: 'rgba(196,240,66,0.12)', border: '1px solid rgba(196,240,66,0.3)',
              borderRadius: 5, padding: '1px 5px', margin: '0 1px', verticalAlign: 1,
            }}>
              {p.label}
            </span>
          ) : (
            <span key={i}>{p.text}</span>
          )
        )}
      </div>

      {sources.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingLeft: 2 }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: c.muted }}>sources</span>
          {sources.map((page) => (
            <span key={page} style={{
              fontFamily: mono, fontSize: 11, color: c.lime,
              background: 'rgba(196,240,66,0.08)', border: '1px solid rgba(196,240,66,0.28)',
              borderRadius: 999, padding: '3px 9px',
            }}>
              p.{page}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// The refusal: deliberately drawn UNLIKE an answer — dashed border, no fill,
// muted italic mono, ban icon, no citation pills. This visible contrast is the
// grounding feature made visible.
function RefusalBubble({ text }) {
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '88%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        border: `1px dashed ${c.faint}`, borderRadius: '14px 14px 14px 4px',
        background: 'transparent', padding: '14px 16px',
        display: 'flex', alignItems: 'flex-start', gap: 11,
      }}>
        <span style={{ flexShrink: 0, marginTop: 2 }}><BanIcon /></span>
        <span style={{ fontFamily: mono, fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.6, color: c.muted }}>
          {text}
        </span>
      </div>
      <span style={{ fontFamily: mono, fontSize: 11, color: c.faint, paddingLeft: 2 }}>
        no sources — grounding held
      </span>
    </div>
  )
}

function Thinking() {
  const dot = (delay) => ({
    width: 5, height: 5, borderRadius: '50%', background: c.muted,
    animation: `blink 1.2s infinite ${delay}`,
  })
  return (
    <div style={{
      alignSelf: 'flex-start', background: c.surface, border: `1px solid ${c.border}`,
      borderRadius: '14px 14px 14px 4px', padding: '13px 16px',
      display: 'inline-flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ fontFamily: mono, fontSize: 13, color: c.muted }}>thinking…</span>
      <span style={{ display: 'inline-flex', gap: 3 }}>
        <span style={dot('0s')} />
        <span style={dot('0.2s')} />
        <span style={dot('0.4s')} />
      </span>
    </div>
  )
}

function ErrorLine({ text }) {
  return (
    <div style={{
      alignSelf: 'flex-start', maxWidth: '88%', fontFamily: mono, fontSize: 12.5,
      color: c.error, background: 'rgba(220,80,80,0.08)',
      border: '1px solid rgba(220,80,80,0.28)', borderRadius: 8, padding: '10px 13px',
    }}>
      {text}
    </div>
  )
}
