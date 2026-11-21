export default function Disclaimer({ text }) {
  if (!text) return null
  return <p className="text-xs text-[var(--ink-400)] border-t border-[var(--ink-800)] pt-2 mt-3">{text}</p>
}
