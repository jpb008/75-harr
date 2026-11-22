import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--ink-800)] bg-gradient-to-b from-[var(--ink-900)] to-[var(--ink-950)] shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_8px_24px_-12px_rgba(0,0,0,0.5)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function IconBadge({ icon: Icon, tone = 'accent', size = 'md' }) {
  const tones = {
    accent: 'bg-[var(--accent-a15)] text-[var(--accent-light)]',
    success: 'bg-[var(--success-soft)] text-[var(--success)]',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
    muted: 'bg-[var(--ink-800)] text-[var(--ink-200)]',
  }
  const sizes = { sm: 'h-7 w-7 rounded-lg', md: 'h-9 w-9 rounded-xl', lg: 'h-11 w-11 rounded-2xl' }
  const iconSize = { sm: 15, md: 18, lg: 22 }[size]
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${sizes[size]} ${tones[tone]}`}>
      <Icon size={iconSize} strokeWidth={2} />
    </span>
  )
}

export function SectionCard({ icon, title, hint, children, className = '', right }) {
  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        {icon && <IconBadge icon={icon} />}
        <div className="min-w-0 flex-1">
          <h3 className="text-[var(--ink-50)] font-semibold leading-tight">{title}</h3>
          {hint && <p className="text-xs text-[var(--ink-300)] mt-1 leading-relaxed">{hint}</p>}
        </div>
        {right}
      </div>
      <div className="space-y-5">{children}</div>
    </Card>
  )
}

export function Field({ label, hint, optional, children }) {
  return (
    <div>
      {label && (
        <label className="flex items-baseline gap-2 text-sm font-medium text-[var(--ink-100)] mb-2">
          <span>{label}</span>
          {optional && <span className="text-[11px] font-normal text-[var(--ink-400)]">optional</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-[var(--ink-400)] mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl bg-[var(--ink-950)] border border-[var(--ink-700)] px-3.5 py-2.5 text-[var(--ink-50)] placeholder:text-[var(--ink-400)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-a35)] transition-colors'

export function TextInput({ value, onChange, placeholder, multiline, rows = 3 }) {
  if (multiline) {
    return <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={inputClass} />
  }
  return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
}

function sameNumber(a, b) {
  if (a == null || b == null) return a == b
  return Math.abs(a - b) < 0.051
}

// The typed text is the source of truth while the user types. A new
// `value` from the parent only replaces it when it genuinely differs from
// what this input last reported (e.g. switching units) — never because a
// unit conversion rounded the user's own number on the way back.
export function NumberInput({ value, onChange, min, max, step = 1, suffix, placeholder }) {
  const [text, setText] = useState(value == null ? '' : String(value))
  const lastEmitted = useRef(value)
  useEffect(() => {
    if (!sameNumber(value, lastEmitted.current)) {
      lastEmitted.current = value
      setText(value == null ? '' : String(value))
    }
  }, [value])
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        value={text}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value)
          const n = e.target.value === '' ? null : Number(e.target.value)
          const next = n == null || Number.isNaN(n) ? null : n
          lastEmitted.current = next
          onChange(next)
        }}
        className={`${inputClass} ${suffix ? 'pr-12' : ''}`}
      />
      {suffix && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--ink-400)] pointer-events-none">{suffix}</span>}
    </div>
  )
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm border transition-all active:scale-[0.97] ${
        active
          ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-[0_4px_14px_-6px_var(--accent-a70)]'
          : 'bg-[var(--ink-950)] border-[var(--ink-700)] text-[var(--ink-200)] hover:border-[var(--ink-600)] hover:text-[var(--ink-50)]'
      }`}
    >
      {active && <Check size={14} strokeWidth={3} />}
      {children}
    </button>
  )
}

export function ChipGroup({ options, value, onChange, multi = false, max }) {
  const selected = multi ? value ?? [] : value
  function toggle(id) {
    if (!multi) return onChange(id === selected ? null : id)
    if (selected.includes(id)) return onChange(selected.filter((v) => v !== id))
    if (max && selected.length >= max) return onChange([...selected.slice(1), id])
    return onChange([...selected, id])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o.id} active={multi ? selected.includes(o.id) : selected === o.id} onClick={() => toggle(o.id)}>
          {o.label}
        </Chip>
      ))}
    </div>
  )
}

export function OptionCards({ options, value, onChange, columns = 1 }) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-1 min-[400px]:grid-cols-2' : 'grid-cols-1'}`}>
      {options.map((o) => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            className={`text-left rounded-xl border px-3.5 py-3 transition-all active:scale-[0.99] ${
              active ? 'border-[var(--accent)] bg-[var(--accent-a10)]' : 'border-[var(--ink-700)] bg-[var(--ink-950)] hover:border-[var(--ink-600)]'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-[var(--ink-50)]">{o.label}</span>
              <span
                className={`h-4 w-4 rounded-full border-2 shrink-0 transition-colors ${
                  active ? 'border-[var(--accent)] bg-[var(--accent)] shadow-[inset_0_0_0_2px_var(--ink-950)]' : 'border-[var(--ink-600)]'
                }`}
              />
            </span>
            {o.hint && <span className="block text-xs text-[var(--ink-300)] mt-0.5">{o.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="flex rounded-xl bg-[var(--ink-950)] border border-[var(--ink-700)] p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
            value === o.id ? 'bg-[var(--accent)] text-white' : 'text-[var(--ink-300)] hover:text-[var(--ink-50)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[var(--ink-100)]">{label}</span>
        {hint && <span className="block text-xs text-[var(--ink-400)] mt-0.5">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--ink-700)]'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </span>
    </button>
  )
}

export function Button({ variant = 'primary', className = '', children, ...rest }) {
  const variants = {
    primary:
      'bg-gradient-to-b from-[var(--accent)] to-[var(--accent-strong)] text-white shadow-[0_8px_20px_-10px_var(--accent-a70)] hover:brightness-110 disabled:opacity-50',
    secondary: 'border border-[var(--ink-700)] bg-[var(--ink-900)] text-[var(--ink-100)] hover:border-[var(--ink-600)] hover:text-[var(--ink-50)]',
    ghost: 'text-[var(--ink-300)] hover:text-[var(--ink-50)]',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:active:scale-100 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function ProgressRing({ value, size = 64, stroke = 6, children }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--ink-800)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

export function Disclosure({ title, subtitle, left, right, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)]/60 overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center gap-3 px-3.5 py-3 text-left">
        {left}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-[var(--ink-50)]">{title}</span>
          {subtitle && <span className="block text-xs text-[var(--ink-300)] mt-0.5">{subtitle}</span>}
        </span>
        {right}
        <ChevronDown size={18} className={`shrink-0 text-[var(--ink-400)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-3.5 pb-3.5 pt-0.5 animate-fade-in">{children}</div>}
    </div>
  )
}

export function Pill({ children, tone = 'muted' }) {
  const tones = {
    muted: 'bg-[var(--ink-800)] text-[var(--ink-200)]',
    accent: 'bg-[var(--accent-a15)] text-[var(--accent-light)]',
    success: 'bg-[var(--success-soft)] text-[var(--success)]',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>
}
