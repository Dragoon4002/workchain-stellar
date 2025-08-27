'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { buttonVariants } from '@/components/ui/button'
import { MOCK_CONTRACTS } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import Link from 'next/link'
import { Briefcase, DollarSign, Star, Clock } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  submitted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pending: 'bg-slate-700 text-slate-400 border-slate-600',
  disputed: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function getProgress(contract: typeof MOCK_CONTRACTS[0]) {
  const done = contract.milestones.filter(m => m.status === 'approved').length
  return Math.round((done / contract.milestones.length) * 100)
}

function getActiveMilestone(contract: typeof MOCK_CONTRACTS[0]) {
  return contract.milestones.find(m => m.status === 'active' || m.status === 'submitted')
}

export default function DashboardPage() {
  const [tab, setTab] = useState('freelancer')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-slate-800 border-slate-700 mb-8">
          <TabsTrigger value="freelancer" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">
            As Freelancer
          </TabsTrigger>
          <TabsTrigger value="client" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">
            As Client
          </TabsTrigger>
        </TabsList>

        <TabsContent value="freelancer" className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Active Contracts', value: '2', icon: Briefcase },
              { label: 'Pending Earnings', value: '3,500 XLM', icon: DollarSign, mono: true },
              { label: 'Reputation Score', value: '4.7 / 5.0', icon: Star },
            ].map(({ label, value, icon: Icon, mono }) => (
              <Card key={label} className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className={`text-lg font-bold text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 text-base">Active Contracts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_CONTRACTS.map((c) => {
                const active = getActiveMilestone(c)
                const progress = getProgress(c)
                return (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 truncate">{c.jobTitle}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Client: {shortenAddress(c.clientAddress)}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-slate-700 [&>div]:bg-amber-500" />
                      </div>
                      {active && (
                        <p className="text-xs text-slate-400 mt-1.5">
                          Current: <span className="text-slate-300">{active.description}</span>
                          <Badge className={`ml-2 text-xs ${STATUS_COLOR[active.status]}`}>{active.status}</Badge>
                        </p>
                      )}
                    </div>
                    <Link href={`/contracts/${c.id}`} className={buttonVariants({ variant: 'outline', size: 'sm', className: 'border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0' })}>
                      View
                    </Link>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client" className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Active Jobs', value: '2', icon: Briefcase },
              { label: 'Total Locked', value: '10,500 XLM', icon: DollarSign, mono: true },
              { label: 'Pending Approvals', value: '1', icon: Clock },
            ].map(({ label, value, icon: Icon, mono }) => (
              <Card key={label} className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className={`text-lg font-bold text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 text-base">Your Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_CONTRACTS.map((c) => {
                const active = getActiveMilestone(c)
                const progress = getProgress(c)
                return (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 truncate">{c.jobTitle}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Freelancer: {shortenAddress(c.freelancerAddress)}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-slate-700 [&>div]:bg-amber-500" />
                      </div>
                      {active && (
                        <p className="text-xs text-slate-400 mt-1.5">
                          Next milestone: <span className="text-slate-300">{active.description}</span>
                          <Badge className={`ml-2 text-xs ${STATUS_COLOR[active.status]}`}>{active.status}</Badge>
                        </p>
                      )}
                    </div>
                    <Link href={`/contracts/${c.id}`} className={buttonVariants({ variant: 'outline', size: 'sm', className: 'border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0' })}>
                      Manage
                    </Link>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
