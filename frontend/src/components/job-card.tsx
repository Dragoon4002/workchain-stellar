import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Calendar, User, Layers } from 'lucide-react'
import { shortenAddress } from '@/lib/wallet'
import type { Job } from '@/lib/mock-data'

const CATEGORY_PILL: Record<string, { bg: string; text: string }> = {
  Development: { bg: 'bg-white/10', text: 'text-[#dddddd]' },
  Design:      { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  Security:    { bg: 'bg-red-500/15', text: 'text-red-400' },
  Writing:     { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  Marketing:   { bg: 'bg-pink-500/15', text: 'text-pink-400' },
  Mobile:      { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  Other:       { bg: 'bg-white/8', text: 'text-slate-400' },
}

const STATUS_PILL: Record<string, { bg: string; text: string; dot: string }> = {
  open:        { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  in_progress: { bg: 'bg-white/10', text: 'text-[#dddddd]', dot: 'bg-[#dddddd]' },
  completed:   { bg: 'bg-white/8', text: 'text-slate-400', dot: 'bg-slate-400' },
}

// Inline SVG sparkline — no dep needed
function Sparkline({ data, color = '#dddddd' }: { data: number[]; color?: string }) {
  const w = 80, h = 28
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

// Budget spark data derived from milestone amounts (visual only)
function getBudgetSpark(job: Job): number[] {
  if (job.milestones.length > 1) return job.milestones.map(m => m.amount)
  // fallback: fake trend based on budget
  return [job.budget * 0.2, job.budget * 0.5, job.budget * 0.35, job.budget * 0.8, job.budget]
}

export function JobCard({ job }: { job: Job }) {
  const cat = CATEGORY_PILL[job.category] ?? CATEGORY_PILL.Other
  const st = STATUS_PILL[job.status] ?? STATUS_PILL.open
  const spark = getBudgetSpark(job)

  return (
    <Card className="glass hover:border-white/20 transition-all duration-200 group flex flex-col rounded-2xl overflow-hidden">
      <CardContent className="pt-4 pb-3 flex-1 px-4">
        {/* Top row: category pill + status pill */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cat.bg} ${cat.text}`}>
            {job.category}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {job.status.replace('_', ' ')}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-100 group-hover:text-white line-clamp-2 text-sm leading-snug mb-1.5">
          {job.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">{job.description}</p>

        {/* Budget row with sparkline */}
        <div className="flex items-end justify-between mb-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div>
            <p className="text-[10px] text-slate-600 mb-0.5 uppercase tracking-wide">Budget</p>
            <p className="font-mono text-[#dddddd] font-bold text-base leading-none">{job.budget.toLocaleString()} <span className="text-xs text-white/40 font-normal">XLM</span></p>
          </div>
          <Sparkline data={spark} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {job.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/5 text-slate-500 border border-white/8">
              {tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/5 text-slate-600">+{job.tags.length - 3}</span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[10px] text-slate-600">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="font-mono">{shortenAddress(job.clientAddress)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Layers className="w-3 h-3" />
            {job.milestones.length}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-4">
        <Link
          href={`/app/jobs/${job.id}`}
          className={buttonVariants({ size: 'sm', className: 'w-full bg-[#dddddd] hover:bg-white text-black font-semibold transition-colors rounded-xl' })}
        >
          View Job
        </Link>
      </CardFooter>
    </Card>
  )
}

// Compact list-row variant (no footer button, for dashboard lists)
export function JobCardCompact({ job }: { job: Job }) {
  const cat = CATEGORY_PILL[job.category] ?? CATEGORY_PILL.Other
  const st = STATUS_PILL[job.status] ?? STATUS_PILL.open
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg glass transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${cat.bg} ${cat.text}`}>{job.category}</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${st.bg} ${st.text}`}>
            <span className={`w-1 h-1 rounded-full ${st.dot}`} />
            {job.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-200 truncate">{job.title}</p>
      </div>
      <p className="font-mono text-[#dddddd] text-sm font-semibold shrink-0">{job.budget.toLocaleString()} XLM</p>
      <Link href={`/app/jobs/${job.id}`} className={buttonVariants({ variant: 'outline', size: 'sm', className: 'border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0 text-xs' })}>
        View
      </Link>
    </div>
  )
}
