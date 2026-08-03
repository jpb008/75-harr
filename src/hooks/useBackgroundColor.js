import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { applyBackground, DEFAULT_BACKGROUND } from '../lib/background'

export function useBackgroundColor() {
  const [backgroundColor, setBackgroundColor] = useState(() => loadJSON('backgroundColor', DEFAULT_BACKGROUND))

  useEffect(() => {
    applyBackground(backgroundColor)
    saveJSON('backgroundColor', backgroundColor)
  }, [backgroundColor])

  return [backgroundColor, setBackgroundColor]
}
