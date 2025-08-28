'use client'

import { useState } from 'react'
import { JobCard } from '@/components/job-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { MOCK_JOBS, Job } from '@/lib/mock-data'
import { useWalletStore } from '@/store/wallet'
import { Search } from 'lucide-react'

const CATEGORIES = ['All', 'Development', 'Design', 'Security', 'Writing', 'Marketing', 'Mobile']

export default function ExplorePage() {
  const { address } = useWalletStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>('All')
  const [sort, setSort] = useState<string | null>('newest')
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

  const filtered = MOCK_JOBS
    .filter((j) => {
      const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = !category || category === 'All' || j.category === category
      return matchSearch && matchCat
    })
    .sort((a, b) => sort === 'budget_high' ? b.budget - a.budget : a.budget - b.budget)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
        <p className="text-slate-400">{MOCK_JOBS.length} jobs available on-chain</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/8 text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44 bg-white/5 border-white/8 text-slate-200">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white/5 border-white/8">
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="text-slate-200 focus:bg-white/8">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-44 bg-white/5 border-white/8 text-slate-200">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white/5 border-white/8">
            <SelectItem value="newest" className="text-slate-200 focus:bg-white/8">Newest first</SelectItem>
            <SelectItem value="budget_high" className="text-slate-200 focus:bg-white/8">Budget: High to Low</SelectItem>
            <SelectItem value="budget_low" className="text-slate-200 focus:bg-white/8">Budget: Low to High</SelectItem>
          </SelectContent>
        </Select>
        {address && (
          <Button onClick={loadFromChain} variant="outline" className="border-white/20 text-[#dddddd] hover:bg-white/8 whitespace-nowrap">
            Load on-chain jobs
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-52 bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No jobs match your search.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...chainJobs, ...filtered].map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  )
}
