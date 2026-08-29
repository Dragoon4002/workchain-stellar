'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useWalletStore } from '@/store/wallet'
import {
  getVault,
  getVaultMilestone,
  submitVaultMilestone,
  approveVaultMilestone,
  claimVaultTimeout,
  disputeVaultMilestone,
  stroopsToXlm,
} from '@/lib/contracts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Users, Lock, Zap } from 'lucide-react'

const MILESTONE_STATE: Record<number, { label: string; color: string }> = {
  0: { label: 'Pending', color: 'text-white/40' },
  1: { label: 'Submitted', color: 'text-amber-400' },
  2: { label: 'Approved', color: 'text-emerald-400' },
  3: { label: 'Revision Requested', color: 'text-yellow-400' },
  4: { label: 'Disputed', color: 'text-red-400' },
}

const VAULT_STATE: Record<number, string> = {
  0: 'Funding',
  1: 'Active',
  2: 'Settled',
  3: 'Cancelled',
}

const TIMEOUT_SECS = 72 * 60 * 60 // 72h in seconds

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MilestoneCard({ vaultId, idx, data, isOwner, isParticipant, onAction, nowSecs }: {
  vaultId: number
  idx: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  isOwner: boolean
  isParticipant: boolean
  onAction: () => void
  nowSecs: number
}) {
  const { address } = useWalletStore()
  const [proofUrl, setProofUrl] = useState('')
  const [acting, setActing] = useState(false)

  const state: number = data?.state ?? 0
  const submittedAt: number = Number(data?.submitted_at ?? 0)
  const timeoutAt = submittedAt + TIMEOUT_SECS
  const timedOut = state === 1 && submittedAt > 0 && nowSecs > timeoutAt
  const secsLeft = timeoutAt - nowSecs
  const hoursLeft = Math.max(0, Math.floor(secsLeft / 3600))

  async function act(fn: () => Promise<unknown>) {
    if (!address) return
    setActing(true)
    try {
      await fn()
      onAction()
    } catch (err) {
      console.error(err)
    } finally {
      setActing(false)
    }
  }

  const stateInfo = MILESTONE_STATE[state] ?? MILESTONE_STATE[0]

  return (
    <div className="bg-white/3 border border-white/6 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-mono text-white/30 mb-0.5">Milestone #{idx + 1}</p>
          <p className="text-white font-medium">{data?.description ?? '—'}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-mono text-emerald-400 text-sm font-semibold">
            {data?.amount ? stroopsToXlm(data.amount).toLocaleString() : '—'} XLM
          </span>
          <span className={`text-xs font-mono ${stateInfo.color}`}>{stateInfo.label}</span>
        </div>
      </div>

      {data?.proof_url && (
        <a
          href={data.proof_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-violet-400 hover:text-violet-300 font-mono truncate block mb-3"
        >
          {data.proof_url}
        </a>
      )}

      {state === 1 && !timedOut && secsLeft > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400/70 font-mono mb-3">
          <Clock className="w-3.5 h-3.5" />
          Auto-release in {hoursLeft}h if no response
        </div>
      )}

      {timedOut && (
        <div className="flex items-center gap-1.5 text-xs text-violet-400 font-mono mb-3">
          <Zap className="w-3.5 h-3.5" />
          Timeout elapsed — claimable
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        {/* Submit — participant or owner, state pending/disputed */}
        {(isParticipant || isOwner) && (state === 0 || state === 3) && (
          <div className="flex gap-2 items-center w-full">
            <Input
              placeholder="Proof URL"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="flex-1 bg-white/5 border-white/8 text-white placeholder:text-white/20 text-sm h-8"
            />
            <Button
              size="sm"
              disabled={acting || !proofUrl}
              onClick={() => act(() => submitVaultMilestone(address!, vaultId, idx, proofUrl))}
              className="bg-violet-600 hover:bg-violet-500 text-white h-8 text-xs"
            >
              Submit
            </Button>
          </div>
        )}

        {/* Approve — owner, state submitted, not self-submitted
            ponytail: full self-approval guard needs submitted_by field from contract */}
        {isOwner && state === 1 && !isParticipant && (
          <Button
            size="sm"
            disabled={acting}
            onClick={() => act(() => approveVaultMilestone(address!, vaultId, idx))}
            className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs gap-1"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approve &amp; Release
          </Button>
        )}

        {/* Dispute — owner or participant, state submitted */}
        {(isOwner || isParticipant) && state === 1 && (
          <Button
            size="sm"
            variant="outline"
            disabled={acting}
            onClick={() => act(() => disputeVaultMilestone(address!, vaultId, idx))}
            className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-8 text-xs gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Dispute
          </Button>
        )}

        {/* Claim timeout — participant or owner, state submitted + elapsed */}
        {(isOwner || isParticipant) && timedOut && (
          <Button
            size="sm"
            disabled={acting}
            onClick={() => act(() => claimVaultTimeout(address!, vaultId, idx))}
            className="bg-violet-600 hover:bg-violet-500 text-white h-8 text-xs gap-1"
          >
            <Zap className="w-3.5 h-3.5" />
            Claim (timeout)
          </Button>
        )}
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { address } = useWalletStore()
  const vaultId = parseInt(id, 10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vault, setVault] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nowSecs, setNowSecs] = useState(Math.floor(Date.now() / 1000))

  const load = useCallback(async () => {
    if (!address || isNaN(vaultId)) { setLoading(false); return }
    setLoading(true)
    try {
      const vaultData = await getVault(address, vaultId)
      setVault(vaultData)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = (vaultData as any)?.milestone_count ?? 0
      const ms = await Promise.all(
        Array.from({ length: count }, (_, i) => getVaultMilestone(address, vaultId, i))
      )
      setMilestones(ms)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [address, vaultId])

  useEffect(() => { load() }, [load])

  // tick clock every 1s for timeout countdown display
  useEffect(() => {
    const t = setInterval(() => setNowSecs(Math.floor(Date.now() / 1000)), 1_000)
    return () => clearInterval(t)
  }, [])

  const isOwner = address && vault?.owner === address
  const isParticipant = address && vault?.participants?.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.wallet === address
  )

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/30">
        <p className="font-mono text-sm">Connect wallet to view this project</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/30 font-mono text-sm">
        Loading…
      </div>
    )
  }

  if (!vault) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/30 font-mono text-sm">
        Project not found
      </div>
    )
  }

  const totalXlm = stroopsToXlm(vault.total ?? 0)
  const depositedXlm = stroopsToXlm(vault.deposited ?? 0)
  const approvedCount = milestones.filter((m) => m?.state === 2 || m?.state === 4).length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/app/projects" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Projects
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Project #{vaultId}</p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-serif italic text-4xl text-white">Project Treasury</h1>
          <Badge className={
            vault.state === 1 ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
            vault.state === 2 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
            vault.state === 3 ? 'bg-red-500/15 text-red-400 border-red-500/30' :
            'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }>
            {VAULT_STATE[vault.state] ?? 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1"><Lock className="w-3 h-3" />Treasury</p>
          <p className="text-xl font-semibold font-mono text-emerald-400">{totalXlm.toLocaleString()} XLM</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 mb-1">Funded</p>
          <p className="text-xl font-semibold font-mono text-white">{depositedXlm.toLocaleString()} XLM</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1"><Users className="w-3 h-3" />Participants</p>
          <p className="text-xl font-semibold text-white">{vault.participants?.length ?? 0}</p>
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-3">
          <p className="text-xs text-white/40 mb-1">Milestones</p>
          <p className="text-xl font-semibold text-white">{approvedCount}/{milestones.length}</p>
        </div>
      </div>

      {/* Participants */}
      <section className="mb-8">
        <h2 className="text-white/60 text-xs uppercase tracking-widest font-mono mb-3">Payment Splits</h2>
        <div className="bg-white/5 border border-white/8 rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {vault.participants?.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-0">
              <span className="font-mono text-white/60 text-sm">
                {p.wallet?.slice(0, 6)}…{p.wallet?.slice(-4)}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${(p.bps / 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="font-mono text-violet-400 text-sm w-12 text-right">
                  {(p.bps / 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section>
        <h2 className="text-white/60 text-xs uppercase tracking-widest font-mono mb-3">Milestones</h2>
        {milestones.length === 0 ? (
          <p className="text-white/30 font-mono text-sm py-8 text-center">No milestones</p>
        ) : (
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <MilestoneCard
                key={i}
                vaultId={vaultId}
                idx={i}
                data={m}
                isOwner={!!isOwner}
                isParticipant={!!isParticipant}
                onAction={load}
                nowSecs={nowSecs}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
