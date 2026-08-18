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

// Fixed saturation/lightness per neutral step, per mode — lifted from the
// original hand-tuned violet scale — so every hue produces the same tonal
// rhythm and contrast, and only the hue itself (and now the mode) changes.
// Token roles stay fixed (ink-950 = page ground, ink-50 = strongest text);
// the light ramp just runs the same steps from the other end.
const DARK_RAMP = {
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

const LIGHT_RAMP = {
  950: [28, 97],
  900: [24, 94],
  850: [24, 91],
  800: [26, 87],
  700: [28, 79],
  600: [30, 66],
  400: [24, 47],
  300: [26, 37],
  200: [32, 25],
  100: [42, 15],
  50: [55, 8],
}

// Semantic tokens (complete/missed) are independent of the accent hue, but
// still need different weights per mode — the dark-mode shades are too
// light for AA contrast against a light ground.
const SEMANTIC = {
  dark: {
    success: '#34d399',
    successSoft: 'rgba(16, 185, 129, 0.1)',
    successBorder: 'rgba(16, 185, 129, 0.4)',
    successStrong: 'rgba(16, 185, 129, 0.8)',
    successOnStrong: '#022c22',
    danger: '#fb7185',
    dangerSoft: 'rgba(244, 63, 94, 0.1)',
    dangerBorder: 'rgba(244, 63, 94, 0.4)',
  },
  light: {
    success: '#059669',
    successSoft: 'rgba(5, 150, 105, 0.08)',
    successBorder: 'rgba(5, 150, 105, 0.35)',
    successStrong: 'rgba(5, 150, 105, 0.9)',
    successOnStrong: '#ffffff',
    danger: '#e11d48',
    dangerSoft: 'rgba(225, 29, 72, 0.08)',
    dangerBorder: 'rgba(225, 29, 72, 0.35)',
  },
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

export function applyBackground(hex, mode = 'dark') {
  const hue = hexToHue(hex)
  const root = document.documentElement.style
  const ramp = mode === 'light' ? LIGHT_RAMP : DARK_RAMP
  for (const [step, [s, l]] of Object.entries(ramp)) {
    root.setProperty(`--ink-${step}`, `hsl(${hue}, ${s}%, ${l}%)`)
  }

  const semantic = SEMANTIC[mode] || SEMANTIC.dark
  for (const [key, value] of Object.entries(semantic)) {
    const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase()
    root.setProperty(cssVar, value)
  }

  document.documentElement.style.colorScheme = mode
}
