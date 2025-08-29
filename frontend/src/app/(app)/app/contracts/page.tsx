'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MOCK_CONTRACTS } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, ArrowUpRight, Search, Lock } from 'lucide-react'
import { SlidingTabs } from '@/components/ui/sliding-tabs'

type Filter = 'all' | 'active' | 'completed' | 'disputed'

function statusBadge(status: string) {
  if (status === 'active') return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 capitalize">{status}</Badge>
  if (status === 'completed') return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 capitalize">{status}</Badge>
  return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 capitalize">{status}</Badge>
}

export default function ContractsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return MOCK_CONTRACTS.filter((c) => {
      const matchFilter = filter === 'all' || c.status === filter
      const matchSearch = c.jobTitle.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [filter, search])

  const totalActive = MOCK_CONTRACTS.filter((c) => c.status === 'active').length
  const totalLocked = MOCK_CONTRACTS.reduce((sum, c) => sum + c.lockedAmount, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Escrow</p>
        <h1 className="font-serif italic text-4xl text-white mb-1">Contracts</h1>
        <p className="text-white/40 font-mono text-sm">{MOCK_CONTRACTS.length} total · {totalActive} active</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 mb-1">Total Contracts</p>
          <p className="text-xl font-semibold text-white">{MOCK_CONTRACTS.length}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 mb-1">Active</p>
          <p className="text-xl font-semibold text-blue-400">{totalActive}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 mb-1">Completed</p>
          <p className="text-xl font-semibold text-emerald-400">{MOCK_CONTRACTS.filter((c) => c.status === 'completed').length}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1"><Lock className="w-3 h-3" />Total Locked</p>
          <p className="text-xl font-semibold font-mono text-emerald-400">{totalLocked.toLocaleString()} XLM</p>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SlidingTabs
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Completed' },
            { id: 'disputed', label: 'Disputed' },
          ]}
          defaultActiveId={filter}
          onChange={(id) => setFilter(id as Filter)}
        />
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search by job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/8 text-white placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Contract list */}
      <div className="bg-white/5 border border-white/8 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
            <FileText className="w-10 h-10 opacity-30" />
            <p>No contracts{filter !== 'all' ? ` with status "${filter}"` : ''}{search ? ` matching "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_auto_auto] gap-4 px-6 py-3 text-xs text-white/30 uppercase tracking-wide">
              <span>Job</span>
              <span>Client</span>
              <span>Freelancer</span>
              <span>Total</span>
              <span>Locked</span>
              <span>Progress</span>
              <span>Status</span>
              <span />
            </div>

            {filtered.map((contract) => {
              const approved = contract.milestones.filter((m) => m.status === 'approved').length
              const progress = Math.round((approved / contract.milestones.length) * 100)

              return (
                <div
                  key={contract.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_auto_auto] gap-4 items-center px-6 py-4 hover:bg-white/4 transition-colors"
                >
                  {/* Job title */}
                  <Link
                    href={`/app/contracts/${contract.id}`}
                    className="font-medium text-white hover:text-white transition-colors truncate"
                  >
                    {contract.jobTitle}
                  </Link>

                  {/* Client */}
                  <span className="font-mono text-white/40 text-sm">{shortenAddress(contract.clientAddress)}</span>

                  {/* Freelancer */}
                  <span className="font-mono text-white/40 text-sm">{shortenAddress(contract.freelancerAddress)}</span>

                  {/* Total XLM */}
                  <span className="font-mono text-white/60 text-sm">{contract.totalAmount.toLocaleString()} XLM</span>

                  {/* Locked XLM */}
                  <span className="font-mono text-emerald-400 text-sm">{contract.lockedAmount.toLocaleString()} XLM</span>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40 w-8 text-right">{progress}%</span>
                  </div>

                  {/* Status */}
                  {statusBadge(contract.status)}

                  {/* Open button */}
                  <Link
                    href={`/app/contracts/${contract.id}`}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                    aria-label="Open contract"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
