export const DEFAULT_ACCENT = '#8b5cf6'

// Curated so every option stays legible against the fixed dark-violet base
// and clear of the semantic green/rose used for complete/missed days.
export const ACCENT_PRESETS = [
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Cyan', hex: '#22d3ee' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Ember', hex: '#f97316' },
]

function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const int = parseInt(full, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

// Blends toward black (target 0) or white (target 255) by `amount` (0-1).
function mix([r, g, b], target, amount) {
  const m = (c) => c + (target - c) * amount
  return [m(r), m(g), m(b)]
}

export function applyAccent(hex) {
  const root = document.documentElement.style
  const rgb = hexToRgb(hex)
  const [r, g, b] = rgb

  root.setProperty('--accent', hex)
  root.setProperty('--accent-strong', rgbToHex(mix(rgb, 0, 0.22)))
  root.setProperty('--accent-light', rgbToHex(mix(rgb, 255, 0.25)))

  const alphas = [8, 10, 15, 16, 35, 40, 60, 70]
  for (const a of alphas) {
    root.setProperty(`--accent-a${a}`, `rgba(${r}, ${g}, ${b}, 0.${String(a).padStart(2, '0')})`)
  }
}
