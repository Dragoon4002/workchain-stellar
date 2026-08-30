'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import { MOCK_CONTRACTS, Milestone } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'
import { MilestoneTracker } from '@/components/milestone-tracker'
import { ReviewModal } from '@/components/review-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Lock } from 'lucide-react'

// ponytail: stub shape for localStorage-sourced escrows; swap when chain fetch is implemented
type ContractStub = {
  id: string; jobTitle: string; clientAddress: string; freelancerAddress: string;
  totalAmount: number; lockedAmount: number; status: string;
  milestones: Milestone[]
}

function getLocalContracts(): ContractStub[] {
  if (typeof window === 'undefined') return []
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('workchain:escrows:'))
    const ids = new Set<string>()
    for (const k of keys) {
      const arr: number[] = JSON.parse(localStorage.getItem(k) ?? '[]')
      arr.forEach(id => ids.add(String(id)))
    }
    return Array.from(ids).map(id => ({
      id, jobTitle: `Escrow #${id}`, clientAddress: '', freelancerAddress: '',
      totalAmount: 0, lockedAmount: 0, status: 'active', milestones: []
    }))
  } catch { return [] }
}

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { address } = useWalletStore()
  const me = address ?? ''

  // Bug 1 fix: fall through to localStorage-sourced stubs when mock doesn't match
  const mockContract = MOCK_CONTRACTS.find((c) => c.id === id)
  const contract: ContractStub | undefined = mockContract ?? getLocalContracts().find(c => c.id === id)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [revisionOpen, setRevisionOpen] = useState(false)
  const [revisionFeedback, setRevisionFeedback] = useState('')
  const [proofOpen, setProofOpen] = useState(false)
  const [proofUrl, setProofUrl] = useState('')
  const [acting, setActing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [needsRetryRelease, setNeedsRetryRelease] = useState(false)
  const [disputeConfirmOpen, setDisputeConfirmOpen] = useState(false)

  if (!contract) notFound()
  // ponytail: notFound() returns never but TS doesn't narrow through it — non-null assert is correct here
  const c = contract!

  const approved = c.milestones.filter(m => m.status === 'approved').length
  const progress = Math.round((approved / c.milestones.length) * 100)

  const isFreelancer = me === c.freelancerAddress
  const isClient = me === c.clientAddress

  // ponytail: index used as milestoneId for mock; swap for milestone.id (numeric) when loaded from chain
  const submittedIdx = c.milestones.findIndex(m => m.status === 'submitted')
  const revisionIdx = c.milestones.findIndex(m => m.status === 'revision_requested')
  const activeIdx = c.milestones.findIndex(m => m.status === 'active')

  // Bug 3 fix: revision_requested checked before submitted so freelancer sees pending revision first
  const actionMilestoneId = revisionIdx !== -1 ? revisionIdx
    : submittedIdx !== -1 ? submittedIdx
    : activeIdx

  const activeMilestone = actionMilestoneId !== -1 ? c.milestones[actionMilestoneId] : null

  async function handleSubmitWork() {
    if (!address) return
    const trimmedUrl = proofUrl.trim()
    if (!trimmedUrl) return
    setActing(true)
    setError(null)
    try {
      const { submitMilestone } = await import('@/lib/contracts')
      await submitMilestone(address, actionMilestoneId, trimmedUrl)
      setSuccessMsg('Work submitted!')
      setProofOpen(false)
      setProofUrl('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
    } finally {
      setActing(false)
    }
  }

  async function handleApprove() {
    if (!address) return
    setError(null)
    setActing(true)
    try {
      const { approveMilestone, releaseEscrow } = await import('@/lib/contracts')
      await approveMilestone(address, actionMilestoneId)
      try {
        await releaseEscrow(address, actionMilestoneId)
      } catch {
        setError('Milestone approved but escrow release failed. Click "Retry Release" to try again.')
        setNeedsRetryRelease(true)
        return
      }
      const isLast = actionMilestoneId === c.milestones.length - 1
      if (isLast) {
        setReviewOpen(true)
      } else {
        setSuccessMsg('Milestone approved and escrow released!')
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setActing(false)
    }
  }

  async function handleRetryRelease() {
    if (!address) return
    setActing(true)
    setError(null)
    try {
      const { releaseEscrow } = await import('@/lib/contracts')
      await releaseEscrow(address, actionMilestoneId)
      setNeedsRetryRelease(false)
      const isLast = actionMilestoneId === c.milestones.length - 1
      if (isLast) {
        setReviewOpen(true)
      } else {
        setSuccessMsg('Escrow released!')
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setActing(false)
    }
  }

  async function handleRequestRevision() {
    if (!address || !revisionFeedback.trim()) return
    setActing(true)
    setError(null)
    try {
      const { requestRevision } = await import('@/lib/contracts')
      await requestRevision(address, actionMilestoneId, revisionFeedback.trim())
      setSuccessMsg('Revision requested!')
      setRevisionOpen(false)
      setRevisionFeedback('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
    } finally {
      setActing(false)
    }
  }

  async function handleDispute() {
    if (!address) return
    setDisputeConfirmOpen(false)
    setActing(true)
    setError(null)
    try {
      const { disputeMilestone } = await import('@/lib/contracts')
      await disputeMilestone(address, actionMilestoneId)
      setSuccessMsg('Dispute raised!')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
    } finally {
      setActing(false)
    }
  }

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Contract</p>
        <h1 className="font-serif italic text-3xl text-white mb-3">{c.jobTitle}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-white/8 text-[#dddddd] border-white/15">
            <Lock className="w-3 h-3 mr-1" />
            {c.lockedAmount.toLocaleString()} XLM locked
          </Badge>
          <Badge variant="outline" className="border-white/15 text-white/40 capitalize">
            {c.status}
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-white/40 mb-2">
          <span>Overall progress</span>
          <span>{approved} of {c.milestones.length} milestones approved</span>
        </div>
        <Progress value={progress} className="h-2 bg-white/8 [&>div]:bg-[#dddddd]" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white text-base">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneTracker milestones={c.milestones} />
            </CardContent>
          </Card>

          {/* Revision feedback card — freelancer sees this when client requested revision */}
          {isFreelancer && activeMilestone?.status === 'revision_requested' && activeMilestone.revision_feedback && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-amber-400/70 mb-2">Revision Requested</p>
              <p className="text-white/80 text-sm leading-relaxed">{activeMilestone.revision_feedback}</p>
              {proofOpen ? (
                <div className="mt-3 space-y-2">
                  <input
                    type="url"
                    value={proofUrl}
                    onChange={e => setProofUrl(e.target.value)}
                    placeholder="GitHub link, Figma, etc."
                    className="w-full rounded-md bg-white/5 border border-white/10 text-white/80 placeholder:text-white/30 text-sm px-3 py-2 focus:outline-none focus:border-amber-500/40"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleSubmitWork} disabled={acting || !proofUrl.trim()} className="flex-1 border-amber-500/40 text-amber-300 hover:bg-amber-500/10">Submit</Button>
                    <Button size="sm" variant="outline" onClick={() => { setProofOpen(false); setProofUrl('') }} className="flex-1 border-white/10 text-white/40 hover:bg-white/5">Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setProofOpen(true)} disabled={acting} className="mt-3 border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
                  Resubmit Work
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-white/40 mb-1">Client</p>
                <p className="font-mono text-white/60 text-sm">{shortenAddress(c.clientAddress)}</p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white/20" />
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Freelancer</p>
                <p className="font-mono text-white/60 text-sm">{shortenAddress(c.freelancerAddress)}</p>
              </div>
              <Separator className="bg-white/8" />
              <div className="flex justify-between">
                <span className="text-xs text-white/40">Total Budget</span>
                <span className="font-mono text-[#dddddd] text-sm font-semibold">{c.totalAmount.toLocaleString()} XLM</span>
              </div>
            </CardContent>
          </Card>

          {/* Bug 4 fix: show connect hint when wallet not connected */}
          {!me && (
            <p className="text-xs text-white/40 font-mono text-center py-2">Connect wallet to take actions</p>
          )}

          {(isFreelancer || isClient) && (
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</p>
                )}
                {successMsg && (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-2">{successMsg}</p>
                )}

                {needsRetryRelease && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetryRelease}
                    disabled={acting}
                    className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    Retry Release
                  </Button>
                )}

                {/* Freelancer: submit when milestone is active (not revision — that's in the feedback card) */}
                {isFreelancer && activeMilestone?.status === 'active' && (
                  proofOpen ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={proofUrl}
                        onChange={e => setProofUrl(e.target.value)}
                        placeholder="GitHub link, Figma, etc."
                        className="w-full rounded-md bg-white/5 border border-white/10 text-white/80 placeholder:text-white/30 text-sm px-3 py-2 focus:outline-none focus:border-white/30"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="tile" onClick={handleSubmitWork} disabled={acting || !proofUrl.trim()} className="flex-1 font-semibold">Submit</Button>
                        <Button size="sm" variant="outline" onClick={() => { setProofOpen(false); setProofUrl('') }} className="flex-1 border-white/10 text-white/40 hover:bg-white/5">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="tile" onClick={() => setProofOpen(true)} disabled={acting} className="w-full font-semibold">
                      Submit Work
                    </Button>
                  )
                )}

                {/* Client: three actions when milestone is submitted */}
                {isClient && activeMilestone?.status === 'submitted' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleApprove}
                      disabled={acting}
                      className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Approve
                    </Button>

                    {revisionOpen ? (
                      <div className="space-y-2">
                        <textarea
                          value={revisionFeedback}
                          onChange={e => setRevisionFeedback(e.target.value)}
                          placeholder="Describe what needs to be revised…"
                          rows={3}
                          className="w-full rounded-md bg-white/5 border border-white/10 text-white/80 placeholder:text-white/30 text-sm px-3 py-2 resize-none focus:outline-none focus:border-amber-500/40"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRequestRevision}
                            disabled={acting || !revisionFeedback.trim()}
                            className="flex-1 border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                          >
                            Send
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setRevisionOpen(false); setRevisionFeedback('') }}
                            className="flex-1 border-white/10 text-white/40 hover:bg-white/5"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRevisionOpen(true)}
                        className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                      >
                        Request Revision
                      </Button>
                    )}

                    {/* Bug 2 fix: inline confirm instead of window.confirm */}
                    {disputeConfirmOpen ? (
                      <div className="rounded-md border border-red-500/30 bg-red-500/8 p-3 space-y-2">
                        <p className="text-xs text-red-400">Disputes are irreversible. Continue?</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={handleDispute} disabled={acting} className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10">Confirm</Button>
                          <Button size="sm" variant="outline" onClick={() => setDisputeConfirmOpen(false)} className="flex-1 border-white/10 text-white/40 hover:bg-white/5">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDisputeConfirmOpen(true)}
                        disabled={acting}
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Dispute
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>

    {isClient && (
      <ReviewModal
        open={reviewOpen}
        onClose={() => { setReviewOpen(false) }}
        reviewer={me}
        freelancer={c.freelancerAddress}
        job_id={c.id}
        job_title={c.jobTitle}
      />
    )}
    </>
  )
}
