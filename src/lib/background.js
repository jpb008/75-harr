export const DEFAULT_BACKGROUND = '#8b5cf6'

// Same idea as the accent presets: pick hues that read as distinct dark
// grounds while staying clear of the semantic green/rose used for
// complete/missed days.
export const BACKGROUND_PRESETS = [
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Indigo', hex: '#5b6df5' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Teal', hex: '#14b8c4' },
  { name: 'Copper', hex: '#e07a3e' },
  { name: 'Gold', hex: '#e0b93e' },
  { name: 'Plum', hex: '#c73ee0' },
]

// Fixed saturation/lightness per neutral step — lifted from the original
// hand-tuned violet scale — so every hue produces the same tonal rhythm
// and contrast, and only the hue itself changes.
const RAMP = {
  950: [51, 8],
  900: [45, 11],
  850: [45, 13],
  800: [38, 16],
  700: [36, 23],
  600: [32, 31],
  400: [22, 46],
  300: [22, 56],
  200: [40, 73],
  100: [58, 91],
  50: [100, 97],
}

function hexToHue(hex) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 262 // achromatic seed — fall back to the default violet hue
  const d = max - min
  let h
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0)
      break
    case g:
      h = (b - r) / d + 2
      break
    default:
      h = (r - g) / d + 4
  }
  return Math.round(h * 60)
}

export function applyBackground(hex) {
  const hue = hexToHue(hex)
  const root = document.documentElement.style
  for (const [step, [s, l]] of Object.entries(RAMP)) {
    root.setProperty(`--ink-${step}`, `hsl(${hue}, ${s}%, ${l}%)`)
  }
}
