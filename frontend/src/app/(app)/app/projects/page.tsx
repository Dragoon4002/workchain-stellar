'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWalletStore } from '@/store/wallet'
import { getVault } from '@/lib/contracts'
import { stroopsToXlm } from '@/lib/contracts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderOpen, Plus, ArrowUpRight, Users, Lock } from 'lucide-react'

const VAULT_STATE_LABELS: Record<number, string> = {
  0: 'Funding',
  1: 'Active',
  2: 'Settled',
  3: 'Cancelled',
}

function stateBadge(state: number) {
  if (state === 1) return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">Active</Badge>
  if (state === 2) return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Settled</Badge>
  if (state === 3) return <Badge className="bg-red-500/15 text-red-400 border-red-500/30">Cancelled</Badge>
  return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Funding</Badge>
}

function getVaultIds(wallet: string): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`workchain:vaults:${wallet}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

interface VaultSummary {
  id: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

export default function ProjectsPage() {
  const { address } = useWalletStore()
  const [vaults, setVaults] = useState<VaultSummary[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) return
    const ids = getVaultIds(address)
    setLoading(true)
    if (ids.length === 0) { setLoading(false); return }

    Promise.allSettled(ids.map((id) => getVault(address, id).then((data) => ({ id, data }))))
      .then((results) =>
        setVaults(
          results
            .filter((r): r is PromiseFulfilledResult<VaultSummary> => r.status === 'fulfilled')
            .map((r) => r.value)
        )
      )
      .finally(() => setLoading(false))
  }, [address])

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/30">
        <p className="font-mono text-sm">Connect wallet to view projects</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Settlement Protocol</p>
          <h1 className="font-serif italic text-4xl text-white mb-1">Projects</h1>
          <p className="text-white/40 font-mono text-sm">Programmable project treasuries on Stellar</p>
        </div>
        <Link href="/app/projects/new">
          <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/30 font-mono text-sm">
          Loading vaults…
        </div>
      ) : vaults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <FolderOpen className="w-12 h-12 text-white/20" />
          <p className="text-white/30 font-mono text-sm">No projects yet</p>
          <Link href="/app/projects/new">
            <Button variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 gap-2">
              <Plus className="w-4 h-4" />
              Create your first project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/8 rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto_auto] gap-4 px-6 py-3 text-xs text-white/30 uppercase tracking-wide">
            <span>Project</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />Participants</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" />Total</span>
            <span>Status</span>
            <span />
          </div>
          <div className="divide-y divide-white/6">
            {vaults.map(({ id, data }) => (
              <div
                key={id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto_auto] gap-4 items-center px-6 py-4 hover:bg-white/4 transition-colors"
              >
                <Link href={`/app/projects/${id}`} className="font-medium text-white hover:text-white/80 transition-colors">
                  Project #{id}
                </Link>
                <span className="font-mono text-white/40 text-sm">
                  {data?.participants?.length ?? '—'} members
                </span>
                <span className="font-mono text-emerald-400 text-sm">
                  {data?.total ? stroopsToXlm(data.total).toLocaleString() : '—'} XLM
                </span>
                {stateBadge(data?.state ?? 0)}
                <Link
                  href={`/app/projects/${id}`}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
                  aria-label="Open project"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
