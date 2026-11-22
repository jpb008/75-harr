import { useMemo } from 'react'
import { BookOpen, GraduationCap, PlayCircle, Youtube, Headphones, FileText, ScrollText, Wrench, ExternalLink, Search } from 'lucide-react'
import { Card, IconBadge, Pill } from '../ui'
import { recommendResources } from '../../lib/plan/learning'

const TYPE_META = {
  book: { icon: BookOpen, label: 'Book' },
  course: { icon: GraduationCap, label: 'Course' },
  video: { icon: PlayCircle, label: 'Video' },
  channel: { icon: Youtube, label: 'Channel' },
  podcast: { icon: Headphones, label: 'Podcast' },
  article: { icon: FileText, label: 'Article' },
  guide: { icon: ScrollText, label: 'Guide' },
  tool: { icon: Wrench, label: 'Tool' },
}

function ResourceCard({ resource, why }) {
  const meta = TYPE_META[resource.type] ?? TYPE_META.article
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)]/60 p-3 hover:border-[var(--accent-a40)] transition-colors"
    >
      <IconBadge icon={meta.icon} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--ink-50)] leading-snug group-hover:text-[var(--accent-light)] transition-colors">{resource.title}</p>
          <ExternalLink size={14} className="text-[var(--ink-400)] shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-[var(--ink-300)] mt-0.5">
          {resource.creator} · {meta.label}
        </p>
        <p className="text-sm text-[var(--ink-200)] mt-1.5 leading-relaxed">{resource.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {resource.free ? <Pill tone="success">Free</Pill> : <Pill>Paid</Pill>}
          {why.map((w) => (
            <Pill key={w} tone="accent">
              {w}
            </Pill>
          ))}
        </div>
      </div>
    </a>
  )
}

export default function LearnTab({ answers }) {
  const { sections, unmatchedTopics } = useMemo(() => recommendResources(answers), [answers])

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-sm text-[var(--ink-100)] leading-relaxed">
          Your research library: sources hand-picked from official guidelines, respected authors, free university courses and
          trusted channels, then matched to your answers. Every link was checked when the library was built.
        </p>
      </Card>

      {sections.map((section) => (
        <section key={section.id}>
          <div className="mb-2 px-1">
            <h3 className="text-[var(--ink-50)] font-semibold">{section.title}</h3>
            <p className="text-xs text-[var(--ink-300)]">{section.intro}</p>
          </div>
          <div className="space-y-2">
            {section.items.map(({ resource, why }) => (
              <ResourceCard key={resource.id} resource={resource} why={why} />
            ))}
          </div>
        </section>
      ))}

      {unmatchedTopics.length > 0 && (
        <Card className="p-4">
          <p className="text-sm font-semibold text-[var(--ink-50)]">Not in the library yet</p>
          <p className="text-xs text-[var(--ink-300)] mt-1 mb-3">
            We don't have hand-picked sources for these topics yet. These links search for beginner material — check the creator's
            credentials before relying on it.
          </p>
          <div className="flex flex-wrap gap-2">
            {unmatchedTopics.map(({ topic, searchUrl }) => (
              <a
                key={topic}
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ink-700)] px-3 py-1.5 text-sm text-[var(--ink-100)] hover:border-[var(--accent)]"
              >
                <Search size={14} /> {topic}
              </a>
            ))}
          </div>
        </Card>
      )}

      {sections.length === 0 && (
        <Card className="p-5 text-center text-sm text-[var(--ink-300)]">
          Add goals, focus areas or skills in Edit answers and your library fills in automatically.
        </Card>
      )}
    </div>
  )
}
