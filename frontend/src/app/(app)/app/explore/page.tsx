'use client'

import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { JobCard } from '@/components/job-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { MOCK_JOBS, MOCK_BIDS, Job } from '@/lib/mock-data'
import { useWalletStore } from '@/store/wallet'
import { Search, X } from 'lucide-react'

const CATEGORIES = ['All', 'Development', 'Design', 'Security', 'Writing', 'Marketing', 'Mobile']

// All unique tags across all jobs
const ALL_TAGS = Array.from(new Set(MOCK_JOBS.flatMap((j) => j.tags))).sort()

// Bid count per job for "Most Bids" sort
const BID_COUNTS = Object.fromEntries(
  MOCK_JOBS.map((j) => [j.id, MOCK_BIDS.filter((b) => b.jobId === j.id).length])
)

export default function ExplorePage() {
  const { address } = useWalletStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>('All')
  const [sort, setSort] = useState<string | null>('newest')
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [loading] = useState(false)
  const [chainJobs, setChainJobs] = useState<Job[]>([])

  async function loadFromChain() {
    if (!address) return
    try {
      const { getJob } = await import('@/lib/contracts')
      const raw = await getJob(address, 1) as {
        title: string; description: string; budget: string;
        deadline: string; client: string; state: number
      }
      if (!raw) return
      const chainJob: Job = {
        id: 'chain-1',
        title: raw.title,
        description: raw.description,
        budget: Number(raw.budget) / 10_000_000,
        deadline: new Date(Number(raw.deadline) * 1000).toISOString().split('T')[0],
        clientAddress: raw.client,
        category: 'Development',
        tags: ['On-Chain'],
        status: 'open',
        milestones: [],
        startingPrice: Number(raw.budget) / 10_000_000,
      }
      setChainJobs([chainJob])
    } catch {} // ponytail: swallow silently; chain may not have job #1
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  function clearFilters() {
    setActiveTags(new Set())
    setMinBudget('')
    setMaxBudget('')
    setCategory('All')
    setSort('newest')
    setSearch('')
  }

  const hasActiveFilters = activeTags.size > 0 || minBudget || maxBudget

  const filtered = useMemo(() => {
    const min = minBudget ? Number(minBudget) : 0
    const max = maxBudget ? Number(maxBudget) : Infinity

    return MOCK_JOBS
      .filter((j) => {
        const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.description.toLowerCase().includes(search.toLowerCase())
        const matchCat = !category || category === 'All' || j.category === category
        const matchTags = activeTags.size === 0 || j.tags.some((t) => activeTags.has(t))
        const matchBudget = j.budget >= min && j.budget <= max
        return matchSearch && matchCat && matchTags && matchBudget
      })
      .sort((a, b) =>
        sort === 'budget_high' ? b.budget - a.budget
        : sort === 'budget_low' ? a.budget - b.budget
        : sort === 'most_bids' ? (BID_COUNTS[b.id] ?? 0) - (BID_COUNTS[a.id] ?? 0)
        : 0 // 'newest' — preserve insertion order (mock data is already newest-first)
      )
  }, [search, category, sort, activeTags, minBudget, maxBudget])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Marketplace</p>
        <h1 className="font-serif italic text-4xl text-white mb-2">Browse Jobs</h1>
        <p className="text-white/40 font-mono text-sm">{MOCK_JOBS.length} jobs available on-chain</p>
      </div>

      {/* Search + category + sort row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/8 text-white placeholder:text-white/30"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44 bg-white/5 border-white/8 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#090909] border-white/8">
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="text-white focus:bg-white/8">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/8 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#090909] border-white/8">
            <SelectItem value="newest" className="text-white focus:bg-white/8">Newest first</SelectItem>
            <SelectItem value="budget_high" className="text-white focus:bg-white/8">Budget: High → Low</SelectItem>
            <SelectItem value="budget_low" className="text-white focus:bg-white/8">Budget: Low → High</SelectItem>
            <SelectItem value="most_bids" className="text-white focus:bg-white/8">Most Bids</SelectItem>
          </SelectContent>
        </Select>
        {address && (
          <Button onClick={loadFromChain} variant="outline" className="border-white/20 text-[#dddddd] hover:bg-white/8 whitespace-nowrap">
            Load on-chain jobs
          </Button>
        )}
      </div>

      {/* Filter bar: tags + budget range */}
      <div className="glass border border-white/8 rounded-xl px-4 py-3 mb-6 sticky top-[64px] z-10">
        {/* Tag chips — horizontal scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none flex-nowrap sm:flex-wrap sm:pb-0 sm:mb-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 shrink-0">Skills</span>
          {ALL_TAGS.map((tag) => {
            const active = activeTags.has(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wider border transition-all ${
                  active
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-white/8 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>

        {/* Budget range + clear */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 shrink-0">Budget</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min XLM"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="w-28 h-7 text-xs bg-white/5 border-white/8 text-white placeholder:text-white/20 font-mono"
            />
            <span className="text-white/20 text-xs">–</span>
            <Input
              type="number"
              placeholder="Max XLM"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-28 h-7 text-xs bg-white/5 border-white/8 text-white placeholder:text-white/20 font-mono"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors font-mono"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-52 bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">No jobs match your search.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {[...chainJobs, ...filtered].map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
