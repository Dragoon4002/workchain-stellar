'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { MOCK_CONTRACTS } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'
import { MilestoneTracker } from '@/components/milestone-tracker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Lock } from 'lucide-react'

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { address } = useWalletStore()
  const contract = MOCK_CONTRACTS.find((c) => c.id === id)

  if (!contract) notFound()

  const approved = contract.milestones.filter(m => m.status === 'approved').length
  const progress = Math.round((approved / contract.milestones.length) * 100)

  // ponytail: milestoneId from mock data for now; swap for real id when contract data is loaded from chain
  const activeMilestoneId = contract.milestones.findIndex(m => m.status === 'active')

  async function handleSubmitWork() {
    if (!address) return
    const proofUrl = prompt('Enter proof URL (GitHub link, Figma, etc):')
    if (!proofUrl) return
    try {
      const { submitMilestone } = await import('@/lib/contracts')
      await submitMilestone(address, activeMilestoneId, proofUrl)
      alert('Work submitted!')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Transaction failed')
    }
  }

  async function handleApprove() {
    if (!address) return
    try {
      const { approveMilestone, releaseEscrow } = await import('@/lib/contracts')
      await approveMilestone(address, activeMilestoneId)
      await releaseEscrow(address, activeMilestoneId)
      alert('Milestone approved and escrow released!')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Transaction failed')
    }
  }

  async function handleDispute() {
    if (!address) return
    try {
      const { disputeMilestone } = await import('@/lib/contracts')
      await disputeMilestone(address, activeMilestoneId)
      alert('Dispute raised!')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Transaction failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{contract.jobTitle}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Lock className="w-3 h-3 mr-1" />
            {contract.lockedAmount.toLocaleString()} XLM locked
          </Badge>
          <Badge variant="outline" className="border-slate-600 text-slate-400 capitalize">
            {contract.status}
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Overall progress</span>
          <span>{approved} of {contract.milestones.length} milestones approved</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-800 [&>div]:bg-amber-500" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 text-base">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneTracker milestones={contract.milestones} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-200 text-base">Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">Client</p>
                <p className="font-mono text-slate-300 text-sm">{shortenAddress(contract.clientAddress)}</p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Freelancer</p>
                <p className="font-mono text-slate-300 text-sm">{shortenAddress(contract.freelancerAddress)}</p>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Total Budget</span>
                <span className="font-mono text-amber-500 text-sm font-semibold">{contract.totalAmount.toLocaleString()} XLM</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-200 text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" onClick={handleSubmitWork} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
                Submit Work
              </Button>
              <Button size="sm" variant="outline" onClick={handleApprove} className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                Approve Milestone
              </Button>
              <Button size="sm" variant="outline" onClick={handleDispute} className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10">
                Raise Dispute
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
