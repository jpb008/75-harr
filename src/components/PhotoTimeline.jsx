import { useState } from 'react'
import { formatPretty } from '../lib/dates'

export default function PhotoTimeline({ urls }) {
  const [openIndex, setOpenIndex] = useState(null)
  const dates = Object.keys(urls).sort()

  if (dates.length === 0) return null

  const openDate = openIndex !== null ? dates[openIndex] : null

  function go(delta) {
    setOpenIndex((i) => {
      const next = i + delta
      if (next < 0 || next >= dates.length) return i
      return next
    })
  }

  return (
    <div className="mb-10">
      <h3 className="font-display text-xl text-[var(--ink-50)] mb-3 tracking-wide">Progress photos</h3>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {dates.map((date, i) => (
          <button
            key={date}
            onClick={() => setOpenIndex(i)}
            className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-[var(--ink-800)] hover:border-[var(--accent)] transition-colors"
            title={formatPretty(date)}
          >
            <img src={urls[date]} alt={formatPretty(date)} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {openDate && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4"
          onClick={() => setOpenIndex(null)}
        >
          <div className="flex items-center justify-between w-full max-w-md mb-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-[var(--ink-50)] text-sm font-medium">{formatPretty(openDate)}</p>
            <button onClick={() => setOpenIndex(null)} className="text-[var(--ink-300)] hover:text-white text-xl leading-none px-2">
              ✕
            </button>
          </div>
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <img src={urls[openDate]} alt={formatPretty(openDate)} className="w-full rounded-xl max-h-[70vh] object-contain bg-black" />
            {openIndex > 0 && (
              <button
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center"
                aria-label="Previous photo"
              >
                ‹
              </button>
            )}
            {openIndex < dates.length - 1 && (
              <button
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center"
                aria-label="Next photo"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
