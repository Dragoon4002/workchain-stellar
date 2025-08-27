import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Calendar, User } from 'lucide-react'
import { shortenAddress } from '@/lib/wallet'
import type { Job } from '@/lib/mock-data'

export function JobCard({ job }: { job: Job }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all hover:bg-slate-800 group">
      <CardContent className="pt-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-100 group-hover:text-white line-clamp-1 text-sm">
            {job.title}
          </h3>
          <span className="font-mono text-amber-500 font-semibold text-sm whitespace-nowrap">
            {job.budget.toLocaleString()} XLM
          </span>
        </div>
        <p className="text-slate-400 text-sm line-clamp-2 mb-3">{job.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="font-mono">{shortenAddress(job.clientAddress)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(job.deadline).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Link href={`/jobs/${job.id}`} className={buttonVariants({ size: 'sm', className: 'w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold' })}>
          View Job
        </Link>
      </CardFooter>
    </Card>
  )
}
