'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MOCK_JOBS, MOCK_BIDS, MOCK_CONTRACTS, type Bid } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Calendar, User, DollarSign, CheckCircle, Star,
  TrendingDown, TrendingUp, ChevronDown, ChevronUp,
  MessageSquare, Flag, Send, Briefcase,
} from 'lucide-react'

// ── Bid card (client sees these) ─────────────────────────────────────────────

function BidCard({ bid, startingPrice, onSelect }: {
  bid: Bid; startingPrice: number; onSelect: (bid: Bid) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const cheap = bid.price <= startingPrice

  return (
    <Card className="glass flex flex-col">
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-slate-200 font-semibold text-sm">{bid.freelancerName}</p>
            <p className="font-mono text-slate-500 text-xs">{shortenAddress(bid.freelancerAddress)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-xl font-bold font-mono ${cheap ? 'text-emerald-400' : 'text-amber-400'}`}>
              {bid.price.toLocaleString()} XLM
            </p>
            <span className={`flex items-center justify-end gap-0.5 text-xs ${cheap ? 'text-emerald-500' : 'text-amber-500'}`}>
              {cheap ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {cheap ? 'Under budget' : 'Over starting'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-400 text-sm font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />{bid.reputation.toFixed(1)}
          </span>
          <span className="text-slate-500 text-xs">{bid.completedJobs} jobs</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {bid.skills.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary" className="bg-white/8 text-slate-300 text-xs">{s}</Badge>
          ))}
        </div>

        <div>
          <p className={`text-slate-400 text-sm leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {bid.proposal}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-0.5 mt-1 transition-colors"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
          </button>
        </div>

        <Button
          onClick={() => onSelect(bid)}
          className="w-full bg-[#dddddd] hover:bg-white text-black font-semibold text-sm h-9 mt-1"
        >
          Select this freelancer
        </Button>
      </CardContent>
    </Card>
  )
}

// ── CTA sidebar — switches based on relationship ──────────────────────────────

type Relationship = 'owner' | 'assigned' | 'bidder' | 'stranger'

function CTASidebar({ job, relationship, myBid }: {
  job: typeof MOCK_JOBS[0]
  relationship: Relationship
  myBid: Bid | undefined
}) {
  const [proposal, setProposal] = useState('')
  const [price, setPrice] = useState('')
  const [timeline, setTimeline] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportText, setReportText] = useState('')

  return (
    <Card className="glass sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-200">Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Budget</span>
          <span className="font-mono text-[#dddddd] font-semibold">{job.budget.toLocaleString()} XLM</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Deadline</span>
          <span className="text-slate-200 text-sm">{new Date(job.deadline).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-1.5"><User className="w-4 h-4" /> Client</span>
          <span className="font-mono text-slate-300 text-sm">{shortenAddress(job.clientAddress)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Milestones</span>
          <span className="text-slate-200 text-sm">{job.milestones.length}</span>
        </div>

        <Separator className="bg-slate-700" />

        {/* ── OWNER: manage your job ── */}
        {relationship === 'owner' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
              <Briefcase className="w-4 h-4 text-[#dddddd] shrink-0" />
              <span className="text-sm text-slate-300 font-medium">Your job</span>
            </div>
            <Link
              href={`/app/jobs/${job.id}#bids`}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-[#dddddd] hover:bg-white text-black font-semibold text-sm transition-colors"
            >
              View Bids
            </Link>
          </div>
        )}

        {/* ── ASSIGNED: active contract ── */}
        {relationship === 'assigned' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm text-emerald-300 font-medium">You&apos;re hired for this job</span>
            </div>
            <Link
              href="/app/messages"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-[#dddddd] hover:bg-white text-black font-semibold text-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Message Client
            </Link>
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/8 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-medium text-sm transition-colors"
            >
              <Flag className="w-4 h-4" /> Report / Dispute
            </button>
          </div>
        )}

        {/* ── BIDDER: bid already submitted ── */}
        {relationship === 'bidder' && myBid && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Send className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm text-amber-300 font-medium">Bid submitted</p>
                <p className="text-xs text-amber-500/80 font-mono">{myBid.price.toLocaleString()} XLM</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">Waiting for client to review</p>
            <button
              onClick={() => alert('Bid cancelled.')}
              className="w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/8 hover:border-red-500/30 text-slate-500 hover:text-red-400 font-medium text-sm transition-colors"
            >
              Cancel Bid
            </button>
          </div>
        )}

        {/* ── STRANGER: place a bid ── */}
        {relationship === 'stranger' && (
          <Sheet>
            <SheetTrigger className="w-full">
              <Button className="w-full bg-[#dddddd] hover:bg-white text-black font-semibold">
                Place Your Bid
              </Button>
            </SheetTrigger>
            <SheetContent className="glass text-slate-100">
              <SheetHeader>
                <SheetTitle className="text-slate-100">Place Your Bid</SheetTitle>
                <SheetDescription className="text-slate-400">
                  Set your own price. Client will review all bids.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 mt-6">
                <div>
                  <Label className="text-slate-300 mb-2 block">Your proposal</Label>
                  <Textarea
                    placeholder="Describe your approach, experience, and why you're a great fit..."
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    rows={5}
                    className="bg-white/5 border-white/8 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Your price (XLM)</Label>
                  <Input
                    type="number"
                    placeholder={`e.g. ${job.startingPrice}`}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-white/5 border-white/8 text-slate-100 placeholder:text-slate-500 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Timeline</Label>
                  <Input
                    placeholder="e.g. 3 weeks"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="bg-white/5 border-white/8 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <Button
                  onClick={() => console.log({ proposal, price, timeline, jobId: job.id })}
                  className="w-full bg-[#dddddd] hover:bg-white text-black font-semibold"
                >
                  Submit Bid
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </CardContent>

      {/* Report dialog — shown for assigned freelancers */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="glass border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">Report / Raise Dispute</DialogTitle>
            <DialogDescription className="text-slate-400">
              Describe the issue. This will escalate to platform review and lock the escrow until resolved.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Explain the issue in detail..."
            rows={4}
            className="bg-white/5 border-white/8 text-slate-100 placeholder:text-slate-500"
          />
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setReportOpen(false)} className="text-slate-400 hover:bg-white/8">
              Cancel
            </Button>
            <Button
              onClick={() => { alert('Dispute filed. Escrow locked.'); setReportOpen(false) }}
              className="bg-red-500 hover:bg-red-400 text-white font-semibold"
            >
              File Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { address } = useWalletStore()
  const job = MOCK_JOBS.find((j) => j.id === id)
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)

  if (!job) notFound()

  // ponytail: fall back to mock address when wallet not connected, so UI is always meaningful
  const me = address ?? 'GYOUR_ADDRESS_HERE'

  const bids = MOCK_BIDS.filter((b) => b.jobId === id)
  const myBid = bids.find((b) => b.freelancerAddress === me)
  const assignedContract = MOCK_CONTRACTS.find(
    (c) => c.jobTitle === job.title && c.freelancerAddress === me && c.status === 'active'
  )

  const relationship: Relationship =
    job.clientAddress === me ? 'owner'
    : assignedContract        ? 'assigned'
    : myBid                   ? 'bidder'
    : 'stranger'

  const [sort, setSort] = useState<'price' | 'rating' | 'newest'>('price')
  const sortedBids = [...bids].sort((a, b) =>
    sort === 'price'  ? a.price - b.price
    : sort === 'rating' ? b.reputation - a.reputation
    : new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-white/8 text-[#dddddd] border-white/15">{job.category}</Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-400 capitalize">
                {job.status.replace('_', ' ')}
              </Badge>
              {relationship === 'owner' && (
                <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20">Your job</Badge>
              )}
              {relationship === 'assigned' && (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">Assigned to you</Badge>
              )}
              {relationship === 'bidder' && (
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20">Bid submitted</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{job.title}</h1>
            <p className="text-slate-400 leading-relaxed">{job.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/8 text-slate-300">{tag}</Badge>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-semibold text-sm">
              Starting at {job.startingPrice.toLocaleString()} XLM
            </span>
          </div>

          <Separator className="bg-slate-800" />

          {/* Milestones */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Milestones</h2>
            <div className="space-y-3">
              {job.milestones.map((m, i) => (
                <Card key={m.id} className="glass">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-xs font-mono text-slate-400">
                        {i + 1}
                      </div>
                      <span className="text-slate-200 text-sm">{m.description}</span>
                    </div>
                    <span className="font-mono text-[#dddddd] font-semibold text-sm">
                      {m.amount.toLocaleString()} XLM
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bid list — only owner sees this */}
          {relationship === 'owner' && (
            <div id="bids">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-white">
                  Bids Received <span className="text-slate-400 font-normal text-base">({bids.length})</span>
                </h2>
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <span className="mr-1 text-xs">Sort:</span>
                  {(['price', 'rating', 'newest'] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setSort(k)}
                      className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                        sort === k
                          ? 'bg-[#dddddd] text-black border-[#dddddd]'
                          : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                      }`}
                    >
                      {k === 'price' ? 'Price ↑' : k === 'rating' ? 'Rating ↓' : 'Newest'}
                    </button>
                  ))}
                </div>
              </div>

              {sortedBids.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">No bids yet. Freelancers will start bidding soon.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {sortedBids.map((bid) => (
                    <BidCard key={bid.id} bid={bid} startingPrice={job.startingPrice} onSelect={setSelectedBid} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div>
          <CTASidebar job={job} relationship={relationship} myBid={myBid} />
        </div>
      </div>

      {/* Hire confirmation dialog */}
      <Dialog open={!!selectedBid} onOpenChange={(open) => !open && setSelectedBid(null)}>
        <DialogContent className="glass border-white/10 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Confirm Selection</DialogTitle>
            <DialogDescription className="text-slate-400">
              Hire <span className="text-slate-200 font-semibold">{selectedBid?.freelancerName}</span> for{' '}
              <span className="font-mono text-[#dddddd] font-semibold">{selectedBid?.price.toLocaleString()} XLM</span>?
              A message room will open and the contract will be initialised.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setSelectedBid(null)} className="text-slate-400 hover:bg-white/8">
              Cancel
            </Button>
            <Button
              onClick={() => { alert('Match created! Message room opened.'); setSelectedBid(null) }}
              className="bg-[#dddddd] hover:bg-white text-black font-semibold"
            >
              Confirm & Hire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
