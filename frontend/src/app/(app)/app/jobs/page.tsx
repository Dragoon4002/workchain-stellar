'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_JOBS, MOCK_BIDS, MOCK_CONTRACTS } from '@/lib/mock-data'
import { useWalletStore } from '@/store/wallet'
import { Badge } from '@/components/ui/badge'
import { PlusSquare, Briefcase, ChevronRight } from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  if (status === 'open') return 'border-emerald-500/40 text-emerald-400'
  if (status === 'in_progress') return 'border-blue-500/40 text-blue-400'
  if (status === 'completed') return 'border-slate-500/40 text-slate-400'
  if (status === 'active') return 'border-blue-500/40 text-blue-400'
  if (status === 'accepted') return 'border-emerald-500/40 text-emerald-400'
  if (status === 'rejected') return 'border-red-500/40 text-red-400'
  return 'border-slate-500/40 text-slate-400'
}

function ProgressBar({ milestones }: { milestones: { status: string }[] }) {
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
      <span className="text-xs text-slate-500 font-mono shrink-0">{pct}%</span>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-16 text-center text-slate-500">
      <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-base mb-1">No jobs here</p>
      <p className="text-sm">{label}</p>
    </div>
  )
}

type ClientFilter = 'all' | 'open' | 'in_progress' | 'completed'
type FreelancerFilter = 'all' | 'applied' | 'active' | 'completed'

// ── CLIENT VIEW ───────────────────────────────────────────────────────────────

function ClientView({ me }: { me: string }) {
  const [filter, setFilter] = useState<ClientFilter>('all')

  const myJobs = MOCK_JOBS.filter((j) => j.clientAddress === me)

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
      <div className="flex items-center gap-2 flex-wrap">
        {CLIENT_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-[#dddddd] text-black border-[#dddddd]'
                : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState label={emptyLabels[filter]} />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const bids = MOCK_BIDS.filter((b) => b.jobId === job.id)
            return (
              <div
                key={job.id}
                className="rounded-xl border border-white/10 bg-white/4 backdrop-blur px-5 py-4 space-y-2 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/app/jobs/${job.id}`}
                      className="font-semibold text-slate-100 hover:text-white truncate block"
                    >
                      {job.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge className="bg-white/8 text-slate-300 border-white/10 text-xs">{job.category}</Badge>
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
                    className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors pt-0.5"
                  >
                    View Bids <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-semibold">
                    from {job.startingPrice.toLocaleString()} XLM
                  </span>
                  <span className="text-slate-500 text-xs">
                    Budget: {job.budget.toLocaleString()} XLM
                  </span>
                  <span className="text-slate-500 text-xs">
                    Due {new Date(job.deadline).toLocaleDateString()}
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

  const myBids = MOCK_BIDS.filter((b) => b.freelancerAddress === me)
  const appliedJobIds = new Set(myBids.map((b) => b.jobId))
  const appliedJobs = MOCK_JOBS.filter((j) => appliedJobIds.has(j.id))

  const myContracts = MOCK_CONTRACTS.filter((c) => c.freelancerAddress === me)
  const activeContracts = myContracts.filter((c) => c.status === 'active')
  const completedContracts = myContracts.filter((c) => c.status === 'completed')

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
    if (filter === 'all') {
      const bidRows: Row[] = appliedJobs.map((j) => {
        const bid = myBids.find((b) => b.jobId === j.id)!
        return { kind: 'bid', jobId: j.id, title: j.title, price: bid.price, status: 'pending' }
      })
      const contractRows: Row[] = myContracts.map((c) => ({
        kind: 'contract',
        contractId: c.id,
        title: c.jobTitle,
        amount: c.totalAmount,
        status: c.status as 'active' | 'completed',
      }))
      return [...bidRows, ...contractRows]
    }
    if (filter === 'applied') {
      return appliedJobs.map((j) => {
        const bid = myBids.find((b) => b.jobId === j.id)!
        return { kind: 'bid', jobId: j.id, title: j.title, price: bid.price, status: 'pending' }
      })
    }
    if (filter === 'active') {
      return activeContracts.map((c) => ({
        kind: 'contract',
        contractId: c.id,
        title: c.jobTitle,
        amount: c.totalAmount,
        status: 'active' as const,
      }))
    }
    // completed
    return completedContracts.map((c) => ({
      kind: 'contract',
      contractId: c.id,
      title: c.jobTitle,
      amount: c.totalAmount,
      status: 'completed' as const,
    }))
  }

  const rows = buildRows()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {FREELANCER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-[#dddddd] text-black border-[#dddddd]'
                : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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
                <p className="font-semibold text-slate-100 truncate">{row.title}</p>
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
                className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
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
  // ponytail: fall back to mock address so UI is always populated
  const me = address ?? 'GYOUR_ADDRESS_HERE'
  const [tab, setTab] = useState<'posted' | 'applied'>('posted')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-white">My Jobs</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur border border-white/10 rounded-full px-1 py-1">
            <button
              onClick={() => setTab('posted')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === 'posted' ? 'bg-[#dddddd] text-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Posted
            </button>
            <button
              onClick={() => setTab('applied')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === 'applied' ? 'bg-[#dddddd] text-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Applied
            </button>
          </div>
          {tab === 'posted' && (
            <Link href="/app/jobs/new" className="inline-flex items-center gap-1.5 bg-[#dddddd] hover:bg-white text-black font-semibold h-9 px-4 text-sm rounded-lg transition-colors">
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
