'use client'

import { use, useEffect, useState } from 'react'
import { MOCK_PROFILES, MOCK_FREELANCERS, MOCK_JOBS, FreelancerListing } from '@/lib/mock-data'
import { getReviews, Review } from '@/lib/reviews'
import { shortenAddress } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'
import { ReputationBadge } from '@/components/reputation-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import Image from 'next/image'
import { CheckCircle, Clock, Zap, Star } from 'lucide-react'

export default function ProfilePage({ params }: { params: Promise<{ wallet: string }> }) {
  const { wallet } = use(params)
  const { address } = useWalletStore()
  const profile = MOCK_PROFILES[wallet] ?? { walletAddress: wallet, reputation: 0, totalJobs: 0, skills: [], jobHistory: [] }
  const freelancer: FreelancerListing | undefined = MOCK_FREELANCERS.find((f) => f.walletAddress === wallet)

  const [rep, setRep] = useState({ score: profile.reputation, count: profile.totalJobs })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string>(MOCK_JOBS[0]?.id ?? '')
  const [offerAmount, setOfferAmount] = useState<number>(MOCK_JOBS[0]?.startingPrice ?? 0)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    if (!wallet || !address) return
    import('@/lib/contracts').then(({ getReputation }) => {
      getReputation(address, wallet).then(setRep).catch(() => {})
    })
  }, [wallet, address])

  useEffect(() => {
    setReviews(getReviews(wallet))
  }, [wallet])

  const avgStars = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.stars, 0) / reviews.length) * 10) / 10
    : null

  const skills = freelancer?.skills ?? profile.skills
  const availabilityColor = freelancer?.availability === 'available'
    ? 'bg-emerald-500'
    : freelancer?.availability === 'busy'
    ? 'bg-yellow-500'
    : 'bg-slate-500'
  const availabilityLabel = freelancer?.availability === 'available'
    ? 'Available'
    : freelancer?.availability === 'busy'
    ? 'Busy'
    : 'Unavailable'

  function handleJobSelect(jobId: string) {
    const job = MOCK_JOBS.find((j) => j.id === jobId)
    setSelectedJobId(jobId)
    if (job) setOfferAmount(job.startingPrice)
  }

  function handleSendInvite() {
    alert('Invite sent!')
    setDialogOpen(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="glass h-fit">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-white/20">
              <Image
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${wallet}`}
                alt="Avatar"
                width={80}
                height={80}
                className="w-full h-full"
              />
            </div>
            {freelancer && (
              <p className="text-white font-semibold text-base mb-1">{freelancer.name}</p>
            )}
            {!freelancer && (
              <p className="text-white font-semibold text-base mb-1">Anonymous</p>
            )}
            <p className="font-mono text-white/40 text-sm mb-2">{shortenAddress(wallet)}</p>
            {freelancer && (
              <p className="italic text-white/40 text-xs mb-3">{freelancer.tagline}</p>
            )}
            {freelancer && (
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <span className={`w-2 h-2 rounded-full ${availabilityColor}`} />
                <span className="text-white/60 text-xs">{availabilityLabel}</span>
              </div>
            )}
            <ReputationBadge score={rep.score} count={rep.count} />
            {avgStars !== null && (
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="text-amber-400 text-xl font-bold">{avgStars}</span>
                <span className="text-amber-400 text-base">{'★'.repeat(Math.round(avgStars))}{'☆'.repeat(5 - Math.round(avgStars))}</span>
                <span className="text-white/30 text-xs">({reviews.length})</span>
              </div>
            )}
            {freelancer && (
              <div className="mt-3 space-y-1.5">
                <p className="font-mono text-[#dddddd] text-sm font-semibold">{freelancer.hourlyRate} XLM/hr</p>
                <div className="flex items-center justify-center gap-1.5 text-white/40 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{freelancer.responseTime}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-white/40 text-xs">
                  <Star className="w-3 h-3" />
                  <span>{freelancer.totalEarned.toLocaleString()} XLM earned</span>
                </div>
              </div>
            )}
            <Separator className="bg-slate-700 my-4" />
            <div className="flex flex-wrap gap-1.5 justify-center">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-white/8 text-white/60 text-xs">{skill}</Badge>
              ))}
            </div>
            {wallet !== address && (
              <div className="mt-4">
                <Button
                  variant="tile"
                  className="w-full font-semibold"
                  onClick={() => setDialogOpen(true)}
                >
                  Invite to Job
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="md:col-span-2 space-y-6">
          {/* Job history */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white text-base">Job History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.jobHistory.length === 0 ? (
                <p className="text-white/30 text-sm">No completed jobs yet.</p>
              ) : (
                profile.jobHistory.map((j) => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg glass">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-white text-sm">{j.title}</span>
                    </div>
                    <span className="font-mono text-[#dddddd] text-sm font-semibold">{j.amount.toLocaleString()} XLM</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Portfolio */}
          {freelancer && freelancer.portfolio.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#dddddd]" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {freelancer.portfolio.map((item) => (
                  <div key={item.title} className="p-3 rounded-lg glass">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-white text-sm font-bold">{item.title}</span>
                      <Badge variant="secondary" className="bg-white/8 text-white/60 text-xs shrink-0">{item.tag}</Badge>
                    </div>
                    <p className="text-white/40 text-sm">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {/* Reviews */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white text-base">Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-white/30 text-sm">No reviews yet.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg glass space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-amber-400 text-sm">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
                      <span className="text-white/30 text-xs font-mono">
                        {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs">{r.job_title}</p>
                    <p className="text-white/80 text-sm">{r.text}</p>
                    <p className="text-white/30 text-xs font-mono">{shortenAddress(r.reviewer)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Invite to a Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {MOCK_JOBS.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobSelect(job.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedJobId === job.id
                    ? 'bg-white/10 border border-white/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <p className="text-white text-sm font-medium">{job.title}</p>
                <p className="text-white/40 text-xs font-mono">{job.startingPrice.toLocaleString()} XLM starting</p>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <label className="text-white/40 text-xs mb-1 block">Your offer (XLM)</label>
            <input
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/30"
            />
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="ghost" className="text-white/40" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="tile" className="font-semibold" onClick={handleSendInvite}>
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
