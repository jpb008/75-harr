import { Flag, Briefcase, ShoppingBag, Clapperboard, LineChart, GraduationCap, PiggyBank, Megaphone, FileText, Scissors, Store, AppWindow } from 'lucide-react'
import { SectionCard, Card } from '../ui'
import Disclaimer from '../Disclaimer'

const PATH_META = {
  freelancing: { title: 'Freelancing', icon: Briefcase },
  ecommerce: { title: 'E-commerce', icon: ShoppingBag },
  contentCreation: { title: 'Content creation', icon: Clapperboard },
  affiliateMarketing: { title: 'Affiliate marketing', icon: Megaphone },
  investing: { title: 'Investing', icon: LineChart },
  skillBuilding: { title: 'Skill building', icon: GraduationCap },
  fundamentals: { title: 'Money basics', icon: PiggyBank },
  digitalProducts: { title: 'Digital products', icon: FileText },
  clipping: { title: 'Clipping', icon: Scissors },
  agency: { title: 'Local business services', icon: Store },
  aiApps: { title: 'Apps built with AI', icon: AppWindow },
}

const money = (n) => `$${Number(n).toLocaleString()}`

export default function MoneyTab({ plan }) {
  const f = plan.financial
  if (f.skipped || (f.paths.length === 0 && !f.milestones)) {
    return (
      <Card className="p-5 text-center">
        <p className="text-sm text-[var(--ink-300)]">You skipped money goals. Turn them on any time with Edit answers.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {f.milestones && (
        <SectionCard icon={Flag} title="Your target" hint={f.milestones.framing}>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <p className="text-xs text-[var(--ink-300)]">Monthly target</p>
              <p className="text-xl font-semibold text-[var(--ink-50)] tabular-nums">{money(f.milestones.targetMonthlyIncome)}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-[var(--ink-300)]">Pace needed</p>
              <p className="text-xl font-semibold text-[var(--ink-50)] tabular-nums">+{money(f.milestones.paceNeededPerWeek)}/wk</p>
            </Card>
          </div>
          {f.milestones.checkpoints?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-300)] mb-2">Checkpoints</p>
              <div className="grid grid-cols-4 gap-2">
                {f.milestones.checkpoints.map((c) => (
                  <div key={c.week} className="rounded-xl bg-[var(--ink-950)] border border-[var(--ink-800)] p-2 text-center">
                    <p className="text-[11px] text-[var(--ink-400)]">Week {c.week}</p>
                    <p className="text-sm font-semibold text-[var(--ink-50)] tabular-nums">{money(c.monthlyIncome)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {f.paths.map((path) => {
        const meta = PATH_META[path.id] ?? { title: path.id, icon: Briefcase }
        return (
          <SectionCard key={path.id} icon={meta.icon} title={meta.title} hint="Weekly actions — check them off on the Today tab.">
            <ul className="space-y-2">
              {path.weeklyActions.map((action, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[var(--ink-100)] leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
            {path.note && <p className="text-xs text-[var(--ink-300)] leading-relaxed">{path.note}</p>}
          </SectionCard>
        )
      })}

      {f.fundamentalsTrack && (
        <Card className="p-4">
          <p className="text-sm font-semibold text-[var(--ink-50)]">{f.fundamentalsTrack.label}</p>
          <p className="text-sm text-[var(--ink-300)] mt-1">{f.fundamentalsTrack.note}</p>
        </Card>
      )}

      <Disclaimer text={f.disclaimer} />
    </div>
  )
}
