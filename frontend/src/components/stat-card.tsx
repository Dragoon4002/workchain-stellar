import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// ── Trend badge ──────────────────────────────────────────────────────────────

type Trend = { value: string; up?: boolean; neutral?: boolean }

function TrendBadge({ trend }: { trend: Trend }) {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium'
  if (trend.neutral) return <span className={`${base} bg-white/8 text-slate-400`}>{trend.value}</span>
  const cls = trend.up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
  return <span className={`${base} ${cls}`}>{trend.up ? '↑' : '↓'} {trend.value}</span>
}

// ── Color system ─────────────────────────────────────────────────────────────

export type StatColor = 'amber' | 'purple' | 'blue' | 'green' | 'red' | 'cyan'

const COLOR_MAP: Record<StatColor, { icon: string; pill: string; glow: string }> = {
  amber:  { icon: 'bg-white/8 text-[#dddddd]',             pill: 'bg-white/8 text-[#dddddd]',             glow: 'shadow-white/5' },
  purple: { icon: 'bg-purple-500/10 text-purple-500',     pill: 'bg-purple-500/15 text-purple-400',     glow: 'shadow-purple-500/10' },
  blue:   { icon: 'bg-white/8 text-slate-300',             pill: 'bg-white/8 text-slate-300',             glow: 'shadow-white/5' },
  green:  { icon: 'bg-emerald-500/10 text-emerald-500',   pill: 'bg-emerald-500/15 text-emerald-400',   glow: 'shadow-emerald-500/10' },
  red:    { icon: 'bg-red-500/10 text-red-500',           pill: 'bg-red-500/15 text-red-400',           glow: 'shadow-red-500/10' },
  cyan:   { icon: 'bg-cyan-500/10 text-cyan-500',         pill: 'bg-cyan-500/15 text-cyan-400',         glow: 'shadow-cyan-500/10' },
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface StatCardProps {
  label: string
  value: string
  subValue?: string
  pill?: string
  icon: LucideIcon
  color?: StatColor
  trend?: Trend
  mono?: boolean
}

// ── Component ────────────────────────────────────────────────────────────────

export function StatCard({ label, value, subValue, pill, icon: Icon, color = 'amber', trend, mono }: StatCardProps) {
  const c = COLOR_MAP[color]
  return (
    <Card className={`glass transition-all duration-200 rounded-2xl shadow-lg ${c.glow}`}>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            {trend && <TrendBadge trend={trend} />}
            {pill && <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${c.pill}`}>{pill}</span>}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold text-white leading-none ${mono ? 'font-mono' : ''}`}>{value}</p>
        {subValue && <p className="text-xs text-slate-600 mt-1.5 font-mono">{subValue}</p>}
      </CardContent>
    </Card>
  )
}
