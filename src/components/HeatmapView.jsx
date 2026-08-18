import { formatPretty } from '../lib/dates'

const CELL_STYLES = {
  complete: 'bg-[var(--success-strong)]',
  incomplete: 'bg-[var(--ink-800)]',
  future: 'bg-transparent border border-[var(--ink-800)]',
}

export default function HeatmapView({ cells }) {
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div className="mb-10">
      <h3 className="font-display text-xl text-[var(--ink-50)] mb-3 tracking-wide">All-time activity</h3>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px] w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  title={`${formatPretty(cell.date)} · ${cell.status}`}
                  className={`w-2.5 h-2.5 rounded-[2px] ${CELL_STYLES[cell.status]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-[var(--ink-400)] mt-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--success-strong)]" /> Complete
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--ink-800)]" /> Missed
        </span>
      </div>
    </div>
  )
}
