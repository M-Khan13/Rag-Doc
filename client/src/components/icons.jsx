// Minimal feather-style icons, inlined so there's no icon-library dependency.
// Each takes size + color and inherits nothing surprising.

const base = (size, color, extra = {}) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ...extra,
})

export const FileIcon = ({ size = 16, color = '#14131a' }) => (
  <svg {...base(size, color, { strokeWidth: 2 })}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

export const UploadIcon = ({ size = 17, color = '#7d7a8c' }) => (
  <svg {...base(size, color)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

export const CheckIcon = ({ size = 13, color = '#c4f042' }) => (
  <svg {...base(size, color, { strokeWidth: 2.4 })}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const MessageIcon = ({ size = 17, color = '#4a4856' }) => (
  <svg {...base(size, color)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

export const ArrowUpIcon = ({ size = 16, color = '#14131a' }) => (
  <svg {...base(size, color, { strokeWidth: 2.4 })}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
)

export const BanIcon = ({ size = 16, color = '#7d7a8c' }) => (
  <svg {...base(size, color)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" />
  </svg>
)
