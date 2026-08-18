import { useCallback, useEffect, useState } from 'react'
import { savePhoto, getAllPhotos, deletePhoto } from '../lib/photos'

// Loads every stored photo once as an object URL map ({ dateStr: url }) —
// fine at the scale of a personal daily-photo habit (at most a few hundred
// entries over a long run of attempts).
export function usePhotos() {
  const [urls, setUrls] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAllPhotos()
      .then((all) => {
        if (cancelled) return
        const map = {}
        for (const [date, blob] of Object.entries(all)) map[date] = URL.createObjectURL(blob)
        setUrls(map)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => {
      cancelled = true
    }
  }, [])

  const setPhotoForDate = useCallback(async (dateStr, file) => {
    await savePhoto(dateStr, file)
    setUrls((prev) => {
      if (prev[dateStr]) URL.revokeObjectURL(prev[dateStr])
      return { ...prev, [dateStr]: URL.createObjectURL(file) }
    })
  }, [])

  const removePhotoForDate = useCallback(async (dateStr) => {
    await deletePhoto(dateStr)
    setUrls((prev) => {
      const next = { ...prev }
      if (next[dateStr]) URL.revokeObjectURL(next[dateStr])
      delete next[dateStr]
      return next
    })
  }, [])

  return { urls, loaded, setPhotoForDate, removePhotoForDate }
}
