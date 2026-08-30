'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletStore } from '@/store/wallet'
import { createVault, fundVault, addVaultMilestone, VaultParticipant } from '@/lib/contracts'
import { XLM_TOKEN } from '@/lib/stellar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface MilestoneInput {
  description: string
  amount: string
}

interface ParticipantInput {
  wallet: string
  pct: string // percent, 0-100
}

function addVaultIdToIndex(wallet: string, id: number) {
  if (typeof window === 'undefined') return
  const key = `workchain:vaults:${wallet}`
  try {
    const existing: number[] = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (!existing.includes(id)) {
      localStorage.setItem(key, JSON.stringify([...existing, id]))
    }
  } catch {
    localStorage.setItem(key, JSON.stringify([id]))
  }
}

export default function NewProjectPage() {
  const router = useRouter()
  const { address } = useWalletStore()

  const [totalBudget, setTotalBudget] = useState('')
  const [participants, setParticipants] = useState<ParticipantInput[]>([
    { wallet: '', pct: '100' },
  ])
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { description: '', amount: '' },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bpsSum = participants.reduce((s, p) => s + (parseFloat(p.pct) || 0), 0)

  function addParticipant() {
    setParticipants((prev) => [...prev, { wallet: '', pct: '' }])
  }

  function removeParticipant(i: number) {
    setParticipants((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateParticipant(i: number, field: keyof ParticipantInput, value: string) {
    setParticipants((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))
  }

  function addMilestone() {
    setMilestones((prev) => [...prev, { description: '', amount: '' }])
  }

  function removeMilestone(i: number) {
    setMilestones((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateMilestone(i: number, field: keyof MilestoneInput, value: string) {
    setMilestones((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address) {
      setError('Connect your wallet to continue')
      return
    }
    setError(null)

    if (Math.abs(bpsSum - 100) > 0.001) {
      setError(`Participant splits must sum to 100% (currently ${bpsSum.toFixed(1)}%)`)
      return
    }

    const total = parseFloat(totalBudget)
    if (!total || total <= 0) {
      setError('Enter a valid total budget')
      return
    }

    for (const p of participants) {
      const pct = parseFloat(p.pct)
      if (pct < 0) {
        setError('Participant percentage cannot be negative')
        return
      }
    }

    const wallets = participants.map((p) => p.wallet.trim())
    if (new Set(wallets).size !== wallets.length) {
      setError('Duplicate wallet addresses are not allowed')
      return
    }
    if (!wallets.includes(address)) {
      setError('You (the owner) must be included as a participant to receive payment')
      return
    }

    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i]
      const hasDesc = !!m.description
      const hasAmount = Number(m.amount) > 0
      if (hasDesc && !hasAmount) {
        setError(`Milestone #${i + 1} has a description but no amount`)
        return
      }
      if (!hasDesc && hasAmount) {
        setError(`Milestone #${i + 1} has an amount but no description`)
        return
      }
    }

    const vaultParticipants: VaultParticipant[] = participants.map((p) => ({
      wallet: p.wallet.trim(),
      bps: Math.round(parseFloat(p.pct) * 100),
    }))

    if (vaultParticipants.some((p) => !p.wallet)) {
      setError('All participant wallet addresses are required')
      return
    }

    setSubmitting(true)
    try {
      // 1. create vault
      const vaultId = await createVault(address, XLM_TOKEN, total, vaultParticipants)

      // 2. index immediately so a fundVault failure doesn't orphan the vault
      addVaultIdToIndex(address, vaultId)

      // 3. fund vault
      await fundVault(address, vaultId, total)

      // 4. add milestones
      for (const m of milestones) {
        if (m.description && Number(m.amount) > 0) {
          await addVaultMilestone(address, vaultId, m.description, parseFloat(m.amount))
        }
      }

      router.push(`/app/projects/${vaultId}`)
    } catch (err) {
      setError(String(err))
      setSubmitting(false)
    }
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/30">
        <p className="font-mono text-sm">Connect wallet to create a project</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/app/projects" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-2">New</p>
        <h1 className="font-serif italic text-4xl text-white">Create Project</h1>
        <p className="text-white/40 font-mono text-sm mt-1">Fund a treasury, add participants &amp; milestones</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Budget */}
        <section className="space-y-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Treasury</h2>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-sm">Total Budget (XLM)</Label>
            <Input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 5000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="bg-white/5 border-white/8 text-white placeholder:text-white/20"
              required
            />
            <p className="text-white/30 text-xs font-mono">Funds locked on-chain immediately</p>
          </div>
        </section>

        {/* Participants */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wide">
              Participants
              <span className={`ml-2 text-xs font-mono ${Math.abs(bpsSum - 100) > 0.001 ? 'text-red-400' : 'text-emerald-400'}`}>
                {bpsSum.toFixed(1)}% / 100%
              </span>
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addParticipant}
              className="text-white/40 hover:text-white gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {participants.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  placeholder="Wallet address (G…)"
                  value={p.wallet}
                  onChange={(e) => updateParticipant(i, 'wallet', e.target.value)}
                  className="flex-1 bg-white/5 border-white/8 text-white placeholder:text-white/20 font-mono text-sm"
                  required
                />
                <div className="relative w-24">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    placeholder="%"
                    value={p.pct}
                    onChange={(e) => updateParticipant(i, 'pct', e.target.value)}
                    className="bg-white/5 border-white/8 text-white placeholder:text-white/20 pr-6"
                    required
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">%</span>
                </div>
                {participants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(i)}
                    className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                    aria-label="Remove participant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Milestones */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wide">Milestones</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addMilestone}
              className="text-white/40 hover:text-white gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="bg-white/3 border border-white/6 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-white/30 text-xs font-mono mt-1">#{i + 1}</span>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(i)}
                      className="p-1 text-white/20 hover:text-red-400 transition-colors"
                      aria-label="Remove milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <Textarea
                  placeholder="Milestone description"
                  value={m.description}
                  onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                  className="bg-white/5 border-white/8 text-white placeholder:text-white/20 resize-none text-sm"
                  rows={2}
                />
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Amount (XLM)"
                  value={m.amount}
                  onChange={(e) => updateMilestone(i, 'amount', e.target.value)}
                  className="bg-white/5 border-white/8 text-white placeholder:text-white/20"
                />
              </div>
            ))}
          </div>
        </section>

        {error && (
          <p className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50"
        >
          {submitting ? 'Creating project…' : 'Create & Fund Project'}
        </Button>
      </form>
    </div>
  )
}
