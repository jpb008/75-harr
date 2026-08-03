import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { applyAccent, DEFAULT_ACCENT } from '../lib/accent'

export function useAccentColor() {
  const [accentColor, setAccentColor] = useState(() => loadJSON('accentColor', DEFAULT_ACCENT))

  useEffect(() => {
    applyAccent(accentColor)
    saveJSON('accentColor', accentColor)
  }, [accentColor])

  return [accentColor, setAccentColor]
}
