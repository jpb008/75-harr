import { useRef } from 'react'

export default function ProgressPhotoCard({ dateStr, photoUrl, onSetPhoto }) {
  const inputRef = useRef(null)

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (file) onSetPhoto(dateStr, file)
    e.target.value = ''
  }

  return (
    <div className="mb-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      {photoUrl ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="relative w-full rounded-xl overflow-hidden border border-dashed border-[var(--ink-700)] group"
        >
          <img src={photoUrl} alt="Today's progress" className="w-full h-40 object-cover" />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-sm font-medium">Replace photo</span>
          </span>
        </button>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-[var(--ink-700)] bg-[var(--ink-900)] hover:border-[var(--ink-600)] transition-colors py-5 flex flex-col items-center justify-center gap-1.5 text-[var(--ink-300)]"
        >
          <span className="text-xl">📸</span>
          <span className="text-sm">Add today's progress photo</span>
        </button>
      )}
    </div>
  )
}
