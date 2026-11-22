import { Flame, ClipboardList, BarChart3, Target, Settings } from 'lucide-react'

const TABS = [
  { id: 'today', label: 'Today', icon: Flame },
  { id: 'plan', label: 'Plan', icon: ClipboardList },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// A fixed bottom bar: icon + short label per tab fits five tabs even on a
// 320px-wide phone, and sits where thumbs already are.
export default function NavTabs({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-[var(--ink-950)]/90 backdrop-blur-md border-t border-[var(--ink-800)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-xl mx-auto grid grid-cols-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] font-medium transition-colors ${
                isActive ? 'text-[var(--ink-50)]' : 'text-[var(--ink-400)] hover:text-[var(--ink-100)]'
              }`}
            >
              {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--accent)]" />}
              <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-[var(--accent-a15)] text-[var(--accent-light)]' : ''}`}>
                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
              </span>
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
