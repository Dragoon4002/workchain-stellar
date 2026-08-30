'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWalletStore } from '@/store/wallet'
import { getJob, stroopsToXlm } from '@/lib/contracts'
import { MOCK_JOBS } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { PlusSquare, Briefcase, ChevronRight } from 'lucide-react'
import { SlidingTabs } from '@/components/ui/sliding-tabs'

// ── helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  if (status === 'open') return 'border-emerald-500/40 text-emerald-400'
  if (status === 'in_progress') return 'border-blue-500/40 text-blue-400'
  if (status === 'completed') return 'border-slate-500/40 text-white/40'
  if (status === 'active') return 'border-blue-500/40 text-blue-400'
  if (status === 'accepted') return 'border-emerald-500/40 text-emerald-400'
  if (status === 'rejected') return 'border-red-500/40 text-red-400'
  return 'border-slate-500/40 text-white/40'
}

function ProgressBar({ milestones }: { milestones: { status: string }[] }) {
  if (!milestones.length) return null
  const approved = milestones.filter((m) => m.status === 'approved').length
  const pct = Math.round((approved / milestones.length) * 100)
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-white/30 font-mono shrink-0">{pct}%</span>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-16 text-center text-white/30">
      <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-base mb-1">No jobs here</p>
      <p className="text-sm">{label}</p>
    </div>
  )
}

type ClientFilter = 'all' | 'open' | 'in_progress' | 'completed'
type FreelancerFilter = 'all' | 'applied' | 'active' | 'completed'

function getStoredIds(key: string): number[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] }
}

// ── CLIENT VIEW ───────────────────────────────────────────────────────────────

function ClientView({ me }: { me: string }) {
  const [filter, setFilter] = useState<ClientFilter>('all')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chainJobs, setChainJobs] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)

  useEffect(() => {
    const ids = getStoredIds(`workchain:jobs:${me}`)
    if (!ids.length) return
    setLoadingJobs(true)
    Promise.all(ids.map((id) => getJob(me, id).then((data) => ({ id, data }))))
      .then(setChainJobs)
      .catch(console.error)
      .finally(() => setLoadingJobs(false))
  }, [me])

  // map chain data to display shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myJobs = chainJobs.map(({ id, data }: any) => ({
    id: String(id),
    title: data?.title ?? `Job #${id}`,
    budget: data?.budget ? stroopsToXlm(data.budget) : 0,
    startingPrice: data?.budget ? stroopsToXlm(data.budget) : 0,
    deadline: data?.deadline ? new Date(Number(data.deadline) * 1000).toISOString() : '',
    status: data?.state === 0 ? 'open' : data?.state === 1 ? 'in_progress' : 'completed',
    clientAddress: me,
    milestones: [] as { status: string }[],
  }))

  const filtered = filter === 'all' ? myJobs : myJobs.filter((j) => j.status === filter)

  const CLIENT_TABS: { key: ClientFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ]

  const emptyLabels: Record<ClientFilter, string> = {
    all: 'Post your first job to get started.',
    open: 'No open jobs right now.',
    in_progress: 'No jobs currently in progress.',
    completed: 'No completed jobs yet.',
  }

  return (
    <div className="space-y-5">
      <SlidingTabs
        tabs={CLIENT_TABS.map(({ key, label }) => ({ id: key, label }))}
        defaultActiveId={filter}
        onChange={(id) => setFilter(id as ClientFilter)}
      />

      {loadingJobs ? (
        <div className="py-16 text-center text-white/30 font-mono text-sm">Loading jobs…</div>
      ) : filtered.length === 0 ? (
        <EmptyState label={emptyLabels[filter]} />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const bids: { jobId: string }[] = []
            return (
              <div
                key={job.id}
                className="rounded-xl border border-white/10 bg-white/4 backdrop-blur px-5 py-4 space-y-2 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/app/jobs/${job.id}`}
                      className="font-semibold text-white hover:text-white truncate block"
                    >
                      {job.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Badge className="bg-white/8 text-white/60 border-white/10 text-xs">{(job as any).category ?? 'Job'}</Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${statusColor(job.status)}`}
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Link
                    href={`/app/jobs/${job.id}`}
                    className="shrink-0 flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors pt-0.5"
                  >
                    View Bids <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-semibold">
                    from {job.startingPrice.toLocaleString()} XLM
                  </span>
                  <span className="text-white/30 text-xs">
                    Budget: {job.budget.toLocaleString()} XLM
                  </span>
                  <span className="text-white/30 text-xs">
                    Due {job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
                    {bids.length} bid{bids.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {job.status === 'in_progress' && (
                  <ProgressBar milestones={job.milestones} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── FREELANCER VIEW ───────────────────────────────────────────────────────────

function FreelancerView({ me }: { me: string }) {
  const [filter, setFilter] = useState<FreelancerFilter>('all')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bidJobs, setBidJobs] = useState<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !me) return
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(`workchain:bids:${me}`) ?? '[]')
      setBidJobs(ids.map((id) => ({ id })))
    } catch { /* ignore */ }
  }, [me])

  const appliedJobs = bidJobs.map(({ id }: { id: string }) => {
    const mock = MOCK_JOBS.find((j) => j.id === id)
    return { jobId: id, title: mock?.title ?? `Job #${id}`, price: mock?.budget ?? 0 }
  })

  const FREELANCER_TABS: { key: FreelancerFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'applied', label: 'Applied' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ]

  const emptyLabels: Record<FreelancerFilter, string> = {
    all: 'Start bidding on jobs to see them here.',
    applied: 'No pending applications.',
    active: 'No active contracts.',
    completed: 'No completed contracts yet.',
  }

  // Build unified row list per filter
  type Row =
    | { kind: 'bid'; jobId: string; title: string; price: number; status: 'pending' }
    | { kind: 'contract'; contractId: string; title: string; amount: number; status: 'active' | 'completed' }

  function buildRows(): Row[] {
    const bidRows: Row[] = appliedJobs.map((j) => ({
      kind: 'bid', jobId: j.jobId, title: j.title, price: j.price, status: 'pending' as const,
    }))
    if (filter === 'all' || filter === 'applied') return bidRows
    return []
  }

  const rows = buildRows()

  return (
    <div className="space-y-5">
      <SlidingTabs
        tabs={FREELANCER_TABS.map(({ key, label }) => ({ id: key, label }))}
        defaultActiveId={filter}
        onChange={(id) => setFilter(id as FreelancerFilter)}
      />

      {rows.length === 0 ? (
        <EmptyState label={emptyLabels[filter]} />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.kind === 'bid' ? `bid-${row.jobId}` : `contract-${row.contractId}`}
              className="rounded-xl border border-white/10 bg-white/4 backdrop-blur px-5 py-4 flex items-center justify-between gap-4 hover:border-white/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{row.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="font-mono text-amber-400 text-xs font-semibold">
                    {row.kind === 'bid'
                      ? `Your bid: ${row.price.toLocaleString()} XLM`
                      : `Contract: ${row.amount.toLocaleString()} XLM`}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${statusColor(row.status)}`}
                  >
                    {row.status}
                  </Badge>
                </div>
              </div>
              <Link
                href={row.kind === 'bid' ? `/app/jobs/${row.jobId}` : `/app/contracts/${row.contractId}`}
                className="shrink-0 flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
              >
                View <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { address } = useWalletStore()
  const me = address ?? ''
  const [tab, setTab] = useState<'posted' | 'applied'>('posted')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-1">Work</p>
          <h1 className="font-serif italic text-3xl text-white">My Jobs</h1>
        </div>
        <div className="flex items-center gap-3">
          <SlidingTabs
            tabs={[
              { id: 'posted', label: 'Posted' },
              { id: 'applied', label: 'Applied' },
            ]}
            defaultActiveId={tab}
            onChange={(id) => setTab(id as 'posted' | 'applied')}
          />
          {tab === 'posted' && (
            <Link href="/app/jobs/new" className={buttonVariants({ variant: 'tile', className: 'inline-flex items-center gap-1.5 font-semibold h-9 px-4 text-sm' })}>
              <PlusSquare className="w-4 h-4" />
              Post a Job
            </Link>
          )}
        </div>
      </div>

      {tab === 'posted' ? <ClientView me={me} /> : <FreelancerView me={me} />}
    </div>
  )
}
