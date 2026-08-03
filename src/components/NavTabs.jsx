const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'progress', label: 'Progress' },
  { id: 'settings', label: 'Settings' },
]

export default function NavTabs({ active, onChange }) {
  return (
    <nav className="sticky top-0 z-10 bg-ink-950/85 backdrop-blur border-b border-ink-800">
      <div className="max-w-xl mx-auto flex items-center px-4">
        <span className="font-display text-lg text-violet-400 pr-4 select-none">75<span className="text-ink-100">HARD</span></span>
        <div className="flex flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                active === tab.id
                  ? 'border-violet-500 text-ink-50'
                  : 'border-transparent text-ink-300 hover:text-ink-100'
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
