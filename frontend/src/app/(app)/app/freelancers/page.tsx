'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Star, Clock, CheckCircle, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { MOCK_FREELANCERS, MOCK_JOBS, FreelancerListing } from '@/lib/mock-data'

const CATEGORIES = ['All', 'Development', 'Design', 'Security', 'Writing', 'Marketing']

const AVAILABILITY_DOT: Record<FreelancerListing['availability'], string> = {
  available: 'bg-green-400',
  busy: 'bg-amber-400',
  unavailable: 'bg-red-500',
}

type SortKey = 'top_rated' | 'rate_asc' | 'rate_desc' | 'most_jobs'

function sortFreelancers(list: FreelancerListing[], sort: SortKey): FreelancerListing[] {
  return [...list].sort((a, b) => {
    if (sort === 'top_rated') return b.reputation - a.reputation
    if (sort === 'rate_asc') return a.hourlyRate - b.hourlyRate
    if (sort === 'rate_desc') return b.hourlyRate - a.hourlyRate
    return b.completedJobs - a.completedJobs
  })
}

function InviteDialog({
  freelancer,
  onClose,
}: {
  freelancer: FreelancerListing
  onClose: () => void
}) {
  const [selectedJobId, setSelectedJobId] = useState<string>(MOCK_JOBS[0]?.id ?? '')
  const selectedJob = MOCK_JOBS.find((j) => j.id === selectedJobId)
  const [offer, setOffer] = useState<number>(selectedJob?.startingPrice ?? 0)

  function handleJobSelect(id: string) {
    setSelectedJobId(id)
    const j = MOCK_JOBS.find((j) => j.id === id)
    if (j) setOffer(j.startingPrice)
  }

  function handleSend() {
    alert('Invite sent! They will receive your offer.')
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="bg-[#0f1117] border border-white/10 text-slate-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Invite {freelancer.name} to a Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {MOCK_JOBS.map((job) => (
            <button
              key={job.id}
              onClick={() => handleJobSelect(job.id)}
              className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                selectedJobId === job.id
                  ? 'border-[#dddddd]/60 bg-white/8'
                  : 'border-white/8 bg-white/4 hover:bg-white/6'
              }`}
            >
              <p className="font-medium text-sm text-slate-100">{job.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">Starting price: {job.startingPrice} XLM</p>
            </button>
          ))}
        </div>

        <div className="mt-2">
          <label className="text-xs text-slate-400 block mb-1">Your offer (XLM)</label>
          <Input
            type="number"
            value={offer}
            onChange={(e) => setOffer(Number(e.target.value))}
            className="bg-white/5 border-white/8 text-slate-100"
          />
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="border-white/20 text-slate-300 hover:bg-white/8">
            Cancel
          </Button>
          <Button onClick={handleSend} className="bg-[#dddddd] text-black hover:bg-white">
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FreelancerCard({ f }: { f: FreelancerListing }) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const visibleSkills = f.skills.slice(0, 4)
  const extraSkills = f.skills.length - 4

  return (
    <>
      <div className="bg-white/5 border border-white/8 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-sm">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${f.walletAddress}`}
            className="w-12 h-12 rounded-full shrink-0 bg-white/10"
            alt={f.name}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{f.name}</span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${AVAILABILITY_DOT[f.availability]}`} />
            </div>
            <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{f.tagline}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            {f.reputation.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            {f.completedJobs} jobs
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {f.responseTime} response
          </span>
        </div>

        {/* Rate */}
        <div className="font-mono text-xl font-semibold text-[#dddddd]">
          {f.hourlyRate} <span className="text-sm font-sans font-normal text-slate-400">XLM/hr</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map((s) => (
            <Badge key={s} variant="secondary" className="bg-white/8 text-slate-300 border-white/10 text-xs">
              {s}
            </Badge>
          ))}
          {extraSkills > 0 && (
            <Badge variant="secondary" className="bg-white/8 text-slate-500 border-white/10 text-xs">
              +{extraSkills} more
            </Badge>
          )}
        </div>

        {/* Portfolio preview */}
        {f.portfolio.length > 0 && (
          <div className="flex gap-2">
            {f.portfolio.slice(0, 2).map((item) => (
              <div
                key={item.title}
                className="flex-1 bg-white/4 border border-white/6 rounded-xl p-2.5 min-w-0"
              >
                <p className="text-xs font-medium text-slate-200 truncate">{item.title}</p>
                <Badge className="mt-1 bg-white/8 text-slate-400 border-white/10 text-[10px] px-1.5 py-0">
                  {item.tag}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 mt-auto">
          <Link href={`/app/profile/${f.walletAddress}`} className="flex-1 text-center px-3 py-2 rounded-lg border border-white/20 text-[#dddddd] hover:bg-white/8 text-sm transition-colors">
            View Profile
          </Link>
          <Button
            onClick={() => setInviteOpen(true)}
            className="flex-1 bg-[#dddddd] text-black hover:bg-white text-sm"
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            Invite to Job
          </Button>
        </div>
      </div>

      {inviteOpen && <InviteDialog freelancer={f} onClose={() => setInviteOpen(false)} />}
    </>
  )
}

export default function FreelancersPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<SortKey>('top_rated')
  const [availableOnly, setAvailableOnly] = useState(false)

  const filtered = sortFreelancers(
    MOCK_FREELANCERS.filter((f) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.tagline.toLowerCase().includes(q) ||
        f.skills.some((s) => s.toLowerCase().includes(q))
      const matchCat = category === 'All' || f.category === category
      const matchAvail = !availableOnly || f.availability === 'available'
      return matchSearch && matchCat && matchAvail
    }),
    sort,
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Find Talent</h1>
        <p className="text-slate-400">Browse verified Web3 professionals</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search by name, tagline, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/5 border-white/8 text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                category === c
                  ? 'bg-[#dddddd] text-black border-[#dddddd]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/8'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="ml-auto bg-white/5 border border-white/8 text-slate-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-white/20"
        >
          <option value="top_rated">Top Rated</option>
          <option value="rate_asc">Hourly: Low→High</option>
          <option value="rate_desc">Hourly: High→Low</option>
          <option value="most_jobs">Most Jobs</option>
        </select>

        {/* Availability toggle */}
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="accent-[#dddddd] w-4 h-4"
          />
          Available only
        </label>
      </div>

      {/* Results count */}
      <p className="text-slate-500 text-sm mb-5">{filtered.length} freelancer{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No freelancers match your search.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((f) => <FreelancerCard key={f.walletAddress} f={f} />)}
        </div>
      )}
    </div>
  )
}
