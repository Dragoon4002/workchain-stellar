'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import { MOCK_JOBS } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calendar, User, DollarSign, CheckCircle } from 'lucide-react'

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const job = MOCK_JOBS.find((j) => j.id === id)
  const [proposal, setProposal] = useState('')
  const [timeline, setTimeline] = useState('')

  if (!job) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">{job.category}</Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-400 capitalize">{job.status.replace('_', ' ')}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{job.title}</h1>
            <p className="text-slate-400 leading-relaxed">{job.description}</p>
          </div>

          <Separator className="bg-slate-800" />

          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Milestones</h2>
            <div className="space-y-3">
              {job.milestones.map((m, i) => (
                <Card key={m.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-mono text-slate-400">
                        {i + 1}
                      </div>
                      <span className="text-slate-200 text-sm">{m.description}</span>
                    </div>
                    <span className="font-mono text-amber-500 font-semibold text-sm">{m.amount.toLocaleString()} XLM</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-200">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Budget</span>
                <span className="font-mono text-amber-500 font-semibold">{job.budget.toLocaleString()} XLM</span>
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
              <Sheet>
                <SheetTrigger className="w-full">
                  <Button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
                    Apply for this Job
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 border-slate-700 text-slate-100">
                  <SheetHeader>
                    <SheetTitle className="text-slate-100">Submit Proposal</SheetTitle>
                    <SheetDescription className="text-slate-400">
                      Tell the client why you&apos;re the right fit.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-5 mt-6">
                    <div>
                      <Label className="text-slate-300 mb-2 block">Your Proposal</Label>
                      <Textarea
                        placeholder="Describe your approach, experience, and why you're a great fit..."
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        rows={6}
                        className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300 mb-2 block">Expected Timeline</Label>
                      <Input
                        placeholder="e.g. 3 weeks"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
                      Submit Proposal
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
