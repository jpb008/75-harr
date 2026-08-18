import { useEffect, useRef, useState } from 'react'
import { renderShareCard, canvasToBlob } from '../lib/shareCard'

export default function ShareCardModal({ challenge, dayNumber, streak, isFinished, onClose }) {
  const canvasRef = useRef(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      renderShareCard(canvasRef.current, {
        name: challenge.name,
        dayNumber,
        lengthDays: challenge.lengthDays,
        streak,
        isFinished,
      })
    }
  }, [challenge, dayNumber, streak, isFinished])

  async function download() {
    setBusy(true)
    try {
      const blob = await canvasToBlob(canvasRef.current)
      const filename = `75-hard-day-${dayNumber}.png`

      // Inside the Claude artifact preview, plain download links are inert —
      // use the sandbox's own save capability there when it's available.
      // On the real deployed site window.claude is undefined, so this
      // always falls through to the normal browser download below.
      if (window.claude?.use) {
        try {
          const downloads = await window.claude.use('downloads')
          if (downloads) {
            await downloads.save({ filename, data: blob })
            return
          }
        } catch {
          // capability declined/unavailable — fall back to a normal download
        }
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  async function share() {
    setBusy(true)
    try {
      const blob = await canvasToBlob(canvasRef.current)
      const file = new File([blob], `75-hard-day-${dayNumber}.png`, { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '75 Hard progress' })
      } else {
        await download()
      }
    } catch {
      // user cancelled the share sheet — nothing to do
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--ink-900)] border border-[var(--ink-700)] rounded-2xl p-5 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[var(--ink-50)] font-medium text-sm">Share your progress</p>
          <button onClick={onClose} className="text-[var(--ink-300)] hover:text-[var(--ink-50)] text-xl leading-none px-1">
            ✕
          </button>
        </div>
        <canvas ref={canvasRef} className="w-full aspect-square rounded-xl mb-4" />
        <div className="flex gap-2">
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={share}
              disabled={busy}
              className="flex-1 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] disabled:opacity-60 text-white text-sm font-medium py-2.5 transition-colors"
            >
              Share
            </button>
          )}
          <button
            onClick={download}
            disabled={busy}
            className="flex-1 rounded-lg bg-[var(--ink-800)] hover:bg-[var(--ink-700)] disabled:opacity-60 text-[var(--ink-100)] text-sm font-medium py-2.5 transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
