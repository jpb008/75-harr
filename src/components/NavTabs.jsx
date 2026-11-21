const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'goals', label: 'Goals' },
  { id: 'progress', label: 'Progress' },
  { id: 'plan', label: 'Plan' },
  { id: 'settings', label: 'Settings' },
]

export default function NavTabs({ active, onChange }) {
  return (
    <nav className="sticky top-0 z-10 bg-[var(--ink-950)]/85 backdrop-blur border-b border-[var(--ink-800)]">
      <div className="max-w-xl mx-auto flex items-center px-4">
        <span className="font-display text-lg text-[var(--accent-light)] pr-3 select-none shrink-0">75<span className="text-[var(--ink-100)]">HARD</span></span>
        {/* overflow-x-auto + min-w-fit: tabs share the width evenly when
            there's room, but never shrink below readable text (which is
            what caused labels to visually overlap at narrow phone
            widths) — any overflow scrolls instead of colliding. */}
        <div className="flex flex-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 min-w-fit whitespace-nowrap px-2.5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                active === tab.id
                  ? 'border-[var(--accent)] text-[var(--ink-50)]'
                  : 'border-transparent text-[var(--ink-300)] hover:text-[var(--ink-100)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
