'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SlidingTabs } from '@/components/ui/sliding-tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { buttonVariants } from '@/components/ui/button'
import { MOCK_CONTRACTS, MOCK_JOBS, MOCK_BIDS } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'
import {
  TrendingUp, ArrowUpRight, Briefcase, Star, Lock,
  AlertTriangle, Clock, CheckCircle, XCircle, Users, DollarSign,
} from 'lucide-react'

// ── SVG helpers ──────────────────────────────────────────────────────────────

function AreaChart({ data, color = '#dddddd', height = 100, showDot = false }: {
  data: number[]; color?: string; height?: number; showDot?: boolean
}) {
  const w = 400
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: height - ((v - min) / range) * (height - 16) - 8,
  }))
  const linePts = pts.map(p => `${p.x},${p.y}`).join(' ')
  const fillPts = `0,${height} ${linePts} ${w},${height}`
  const lastPt = pts[pts.length - 1]
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" fill="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#grad-${color.replace('#','')})`} />
      <polyline points={linePts} stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {showDot && (
        <>
          <circle cx={lastPt.x} cy={lastPt.y} r="5" fill={color} />
          <circle cx={lastPt.x} cy={lastPt.y} r="9" fill={color} fillOpacity="0.2" />
        </>
      )}
    </svg>
  )
}

function DonutChart({ slices }: { slices: { value: number; color: string; label: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  const cx = 80, cy = 80, r = 60, inner = 36
  let angle = -Math.PI / 2
  const paths = slices.map(s => {
    const sweep = (s.value / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    const x2 = cx + r * Math.cos(angle + sweep)
    const y2 = cy + r * Math.sin(angle + sweep)
    const xi1 = cx + inner * Math.cos(angle)
    const yi1 = cy + inner * Math.sin(angle)
    const xi2 = cx + inner * Math.cos(angle + sweep)
    const yi2 = cy + inner * Math.sin(angle + sweep)
    const large = sweep > Math.PI ? 1 : 0
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`
    angle += sweep
    return { d, color: s.color }
  })
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} opacity="0.85" />)}
      <circle cx={cx} cy={cy} r={inner - 2} fill="#0a0a0a" />
    </svg>
  )
}

function MiniBar({ value, max, color = '#dddddd' }: { value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-white/40 w-8 text-right">{pct}%</span>
    </div>
  )
}

// ── Constants ────────────────────────────────────────────────────────────────

const OVERVIEW_DATA = [820, 932, 901, 934, 1290, 1330, 1320, 1500, 1620, 1750, 1680, 1900]
const EARNINGS_DATA = [200, 450, 380, 720, 1100, 950, 1400, 1600, 1320, 1800, 2100, 2450]
const SPEND_DATA    = [100, 300, 500, 800, 600, 1200, 900, 1500, 1100, 1700, 1300, 2000]
const MONTHS        = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const STATUS_COLOR: Record<string, string> = {
  approved: 'bg-emerald-500/10 text-emerald-400',
  submitted: 'bg-amber-500/10 text-amber-400',
  active:   'bg-white/8 text-white/60',
  pending:  'bg-white/5 text-white/30',
  disputed: 'bg-red-500/10 text-red-400',
}

function getProgress(c: typeof MOCK_CONTRACTS[0]) {
  const done = c.milestones.filter(m => m.status === 'approved').length
  return Math.round((done / c.milestones.length) * 100)
}

function getActiveMilestone(c: typeof MOCK_CONTRACTS[0]) {
  return c.milestones.find(m => m.status === 'active' || m.status === 'submitted')
}

// ── Derived data ─────────────────────────────────────────────────────────────

const activeContracts   = MOCK_CONTRACTS.filter(c => c.status === 'active')
const disputedContracts = MOCK_CONTRACTS.filter(c => c.status === 'disputed')
const claimableMilestones = MOCK_CONTRACTS.flatMap(c => c.milestones).filter(m => m.status === 'approved')
const claimableXLM      = claimableMilestones.reduce((s, m) => s + m.amount, 0)
const totalLocked       = MOCK_CONTRACTS.reduce((s, c) => s + c.lockedAmount, 0)
const totalSpent        = MOCK_CONTRACTS.flatMap(c => c.milestones)
  .filter(m => m.status === 'approved')
  .reduce((s, m) => s + m.amount, 0)

const now = new Date()
const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

// upcoming deadlines: milestones with a deadline field — MOCK_CONTRACTS don't have per-milestone deadlines,
// so derive from MOCK_JOBS by matching jobTitle
const upcomingDeadlines = MOCK_JOBS
  .filter(j => {
    const d = new Date(j.deadline)
    return d >= now && d <= sevenDaysOut
  })
  .map(j => ({ id: j.id, jobTitle: j.title, deadline: j.deadline }))

const soonestDeadline = MOCK_JOBS
  .filter(j => j.status === 'in_progress')
  .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]

// ── Shared header ─────────────────────────────────────────────────────────────

function SharedHeader({ disputes }: { disputes: number }) {
  const balance = totalLocked
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#dddddd]" />
          </div>
          <div>
            <p className="text-xs text-white/30">Wallet Balance</p>
            <p className="text-lg font-bold font-mono text-white">{balance.toLocaleString()} <span className="text-xs text-white/40">XLM</span></p>
          </div>
        </div>
        <div className="w-px h-10 bg-white/8" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-white/30">Claimable Now</p>
            <p className="text-lg font-bold font-mono text-emerald-400">{claimableXLM.toLocaleString()} <span className="text-xs text-white/40">XLM</span></p>
          </div>
        </div>
        <div className="w-px h-10 bg-white/8" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-500/15 flex items-center justify-center">
            <Star className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-white/30">Rep Score</p>
            <p className="text-lg font-bold text-purple-400">4.7</p>
          </div>
        </div>
        {disputes > 0 && (
          <>
            <div className="w-px h-10 bg-white/8" />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 text-sm font-semibold">
                <XCircle className="w-4 h-4" />
                {disputes} Active {disputes === 1 ? 'Dispute' : 'Disputes'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Freelancer tab ────────────────────────────────────────────────────────────

function FreelancerTab() {
  const { address } = useWalletStore()
  const me = address ?? 'GYOUR_ADDRESS_HERE'

  const myFreelancerContracts = MOCK_CONTRACTS.filter(c => c.freelancerAddress === me)
  const mySubmittedMilestones = myFreelancerContracts.flatMap(c =>
    c.milestones.filter(m => m.status === 'submitted').map(m => ({ ...m, contractId: c.id, jobTitle: c.jobTitle }))
  )
  const myDisputedContracts = myFreelancerContracts.filter(c =>
    c.milestones.some(m => m.status === 'disputed')
  )
  // deadline chips: active contracts where matched job deadline is within 7 days
  const myDeadlineSoon = myFreelancerContracts.flatMap(c => {
    const job = MOCK_JOBS.find(j => j.title === c.jobTitle)
    if (!job) return []
    const d = new Date(job.deadline)
    return d >= now && d <= sevenDaysOut ? [{ contractId: c.id, jobTitle: c.jobTitle, deadline: job.deadline }] : []
  })

  const hasActions = mySubmittedMilestones.length > 0 || myDisputedContracts.length > 0 || myDeadlineSoon.length > 0
  const nextDeadline = soonestDeadline ? new Date(soonestDeadline.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

  return (
    <div className="space-y-4">
      {/* 1. Action strip */}
      <div className="glass rounded-2xl p-5">
        <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-3">Needs Attention</p>
        {!hasActions ? (
          <p className="text-white/40 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> All clear</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {mySubmittedMilestones.map(m => (
              <span key={m.id} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                Milestone submitted – waiting
              </span>
            ))}
            {myDisputedContracts.map(c => (
              <Link key={c.id} href={`/app/contracts/${c.id}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/25 text-xs font-medium hover:bg-red-500/25 transition-colors">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                Dispute active
              </Link>
            ))}
            {myDeadlineSoon.map(d => (
              <Link key={d.contractId} href={`/app/contracts/${d.contractId}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 text-xs font-medium hover:bg-amber-500/25 transition-colors">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Deadline soon – {new Date(d.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 2. Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-[#dddddd]" />
          </div>
          <div>
            <p className="text-xs text-white/30 mb-0.5">Active Contracts</p>
            <p className="text-xl font-bold text-white">{activeContracts.length}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3 h-3" /> +1
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 mb-0.5">Next Deadline</p>
            <p className="text-xl font-bold text-white">{nextDeadline}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 mb-0.5">Total Locked (XLM)</p>
            <p className="text-xl font-bold font-mono text-white">{totalLocked.toLocaleString()}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3 h-3" /> +18%
          </div>
        </div>
      </div>

      {/* 3. Active contracts list */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <span className="text-white font-semibold text-sm">Active Contracts</span>
          <Link href="/app/contracts" className="text-xs text-white/40 hover:text-[#dddddd] transition-colors flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {activeContracts.length === 0 ? (
          <p className="px-5 py-6 text-white/30 text-sm">No active contracts.</p>
        ) : (
          activeContracts.slice(0, 5).map((c, i) => {
            const progress = getProgress(c)
            const active = getActiveMilestone(c)
            return (
              <div key={c.id} className={`flex items-center gap-4 px-5 py-3.5 border-b border-white/4 hover:bg-white/3 transition-colors ${i % 2 !== 0 ? 'bg-white/[0.01]' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{c.jobTitle}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-32 h-1 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full bg-[#dddddd] rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-white/30">{progress}%</span>
                  </div>
                </div>
                {active && (
                  <span className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${STATUS_COLOR[active.status]}`}>
                    {active.status}
                  </span>
                )}
                <Link href={`/app/contracts/${c.id}`}
                  className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
                </Link>
              </div>
            )
          })
        )}
      </div>

      {/* 4. Earnings chart */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-semibold text-sm">Earnings Overview</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#dddddd] inline-block" /> Active 40%</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Pending 30%</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Paid 30%</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col justify-between text-xs text-white/20 py-1 shrink-0">
            {['2.5k','2k','1.5k','1k','500','0'].map(l => <span key={l}>{l}</span>)}
          </div>
          <div className="flex-1 min-w-0">
            <AreaChart data={EARNINGS_DATA} color="#dddddd" height={140} showDot />
            <div className="flex justify-between mt-2">
              {MONTHS.map(m => <span key={m} className="text-xs text-white/20">{m}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Client tab ────────────────────────────────────────────────────────────────

function ClientTab() {
  const { address } = useWalletStore()
  const me = address ?? 'GYOUR_ADDRESS_HERE'

  const myClientContracts = MOCK_CONTRACTS.filter(c => c.clientAddress === me)
  const myApprovableMillestones = myClientContracts.flatMap(c =>
    c.milestones.filter(m => m.status === 'submitted').map(m => ({ ...m, contractId: c.id, jobTitle: c.jobTitle }))
  )
  const myDisputedContracts = myClientContracts.filter(c =>
    c.milestones.some(m => m.status === 'disputed')
  )

  const applicantsThisWeek = MOCK_BIDS.filter(b => {
    const d = new Date(b.submittedAt)
    return d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }).length

  const hasActions = myApprovableMillestones.length > 0 || myDisputedContracts.length > 0

  return (
    <div className="space-y-4">
      {/* 1. Action strip */}
      <div className="glass rounded-2xl p-5">
        <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-3">Needs Attention</p>
        {!hasActions ? (
          <p className="text-white/40 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> All clear</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {myApprovableMillestones.map(m => (
              <Link key={m.id} href={`/app/contracts/${m.contractId}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-xs font-medium hover:bg-emerald-500/25 transition-colors">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Approve milestone
              </Link>
            ))}
            {myDisputedContracts.map(c => (
              <Link key={c.id} href={`/app/contracts/${c.id}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/25 text-xs font-medium hover:bg-red-500/25 transition-colors">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                Dispute active
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 2. Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-[#dddddd]" />
          </div>
          <div>
            <p className="text-xs text-white/30 mb-0.5">Posted Jobs</p>
            <p className="text-xl font-bold text-white">{MOCK_JOBS.length}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 mb-0.5">Applicants This Week</p>
            <p className="text-xl font-bold text-white">{applicantsThisWeek}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <TrendingUp className="w-3 h-3" />
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-white/30 mb-0.5">Total Spent (XLM)</p>
            <p className="text-xl font-bold font-mono text-white">{totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 3. My jobs list */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <span className="text-white font-semibold text-sm">My Jobs</span>
          <Link href="/app/jobs" className="text-xs text-white/40 hover:text-[#dddddd] transition-colors flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {MOCK_JOBS.slice(0, 5).map((j, i) => {
          const bidCount = MOCK_BIDS.filter(b => b.jobId === j.id).length
          const statusColor = j.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' :
            j.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/8 text-white/40'
          return (
            <div key={j.id} className={`flex items-center gap-4 px-5 py-3.5 border-b border-white/4 hover:bg-white/3 transition-colors ${i % 2 !== 0 ? 'bg-white/[0.01]' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{j.title}</p>
                <p className="text-xs text-white/30 mt-0.5">Due {new Date(j.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              {bidCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-xs font-semibold shrink-0">
                  {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${statusColor}`}>
                {j.status.replace('_', ' ')}
              </span>
              <Link href={`/app/jobs/${j.id}`}
                className="text-xs text-white/40 hover:text-[#dddddd] transition-colors flex items-center gap-1 shrink-0">
                View bids <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          )
        })}
      </div>

      {/* 4. Spend chart */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-semibold text-sm">Spend Overview</span>
          <span className="text-xs text-white/30">Monthly XLM</span>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col justify-between text-xs text-white/20 py-1 shrink-0">
            {['2k','1.5k','1k','500','0'].map(l => <span key={l}>{l}</span>)}
          </div>
          <div className="flex-1 min-w-0">
            <AreaChart data={SPEND_DATA} color="#8B5CF6" height={140} showDot />
            <div className="flex justify-between mt-2">
              {MONTHS.map(m => <span key={m} className="text-xs text-white/20">{m}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tab, setTab] = useState<'freelancer' | 'client'>('freelancer')

  return (
    <div className="min-h-screen p-6 space-y-4">
      {/* Shared header */}
      <SharedHeader disputes={disputedContracts.length} />

      {/* Tab pills */}
      <SlidingTabs
        tabs={[
          { id: 'freelancer', label: 'Freelancer' },
          { id: 'client', label: 'Client' },
        ]}
        defaultActiveId={tab}
        onChange={(id) => setTab(id as 'freelancer' | 'client')}
      />

      {/* Tab content */}
      {tab === 'freelancer' ? <FreelancerTab /> : <ClientTab />}
    </div>
  )
}
