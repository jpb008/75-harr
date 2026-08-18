import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { applyBackground, DEFAULT_BACKGROUND } from '../lib/background'

export function useBackgroundColor() {
  const [backgroundColor, setBackgroundColor] = useState(() => loadJSON('backgroundColor', DEFAULT_BACKGROUND))
  const [themeMode, setThemeMode] = useState(() => loadJSON('themeMode', 'dark'))

  useEffect(() => {
    applyBackground(backgroundColor, themeMode)
    saveJSON('backgroundColor', backgroundColor)
    saveJSON('themeMode', themeMode)
  }, [backgroundColor, themeMode])

  return { backgroundColor, setBackgroundColor, themeMode, setThemeMode }
}
