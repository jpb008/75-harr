const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'progress', label: 'Progress' },
  { id: 'settings', label: 'Settings' },
]

export default function NavTabs({ active, onChange }) {
  return (
    <nav className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-xl mx-auto flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              active === tab.id
                ? 'border-ember-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
