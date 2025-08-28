'use client'

import { useEffect, useState } from 'react'
import { useWalletStore } from '@/store/wallet'
import { WalletConnect } from '@/components/wallet-connect'
import { ReputationBadge } from '@/components/reputation-badge'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MOCK_PROFILES, MOCK_FREELANCERS } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import Image from 'next/image'
import { CheckCircle, Briefcase, Star, DollarSign, AlertCircle, Layers } from 'lucide-react'

export default function MyProfilePage() {
  const { address } = useWalletStore()
  const profile = address
    ? (MOCK_PROFILES[address] ?? {
        walletAddress: address,
        reputation: 0,
        totalJobs: 0,
        skills: [],
        jobHistory: [],
      })
    : null

  const [rep, setRep] = useState({ score: profile?.reputation ?? 0, count: profile?.totalJobs ?? 0 })

  useEffect(() => {
    if (!address) return
    import('@/lib/contracts').then(({ getReputation }) => {
      getReputation(address, address).then(setRep).catch(() => {})
    })
  }, [address])

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-[#dddddd]" />
        <h1 className="text-xl font-bold text-white">Connect your wallet</h1>
        <p className="text-slate-400 text-sm">Your profile is linked to your wallet address.</p>
        <WalletConnect />
      </div>
    )
  }

  const totalEarned = profile?.jobHistory.reduce((s, j) => s + j.amount, 0) ?? 0
  const freelancer = MOCK_FREELANCERS.find((f) => f.walletAddress === address) ?? null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      {/* Stat row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Completed Jobs"
          value={String(profile?.totalJobs ?? 0)}
          icon={Briefcase}
          color="blue"
          pill="All time"
        />
        <StatCard
          label="Reputation Score"
          value={rep.score > 0 ? rep.score.toFixed(1) : '—'}
          subValue={`${rep.count} reviews`}
          icon={Star}
          color="purple"
          pill="On-chain"
        />
        <StatCard
          label="Total Earned"
          value={totalEarned > 0 ? totalEarned.toLocaleString() : '0'}
          subValue="XLM"
          icon={DollarSign}
          color="green"
          pill="Lifetime"
          mono
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Identity card */}
        <Card className="glass h-fit">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-white/20">
              <Image
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`}
                alt="Avatar"
                width={80}
                height={80}
                className="w-full h-full"
              />
            </div>
            <p className="text-white font-semibold text-sm mb-1">
              {address === 'GYOUR_ADDRESS_HERE' ? 'Demo Account' : 'Freelancer'}
            </p>
            <p className="font-mono text-slate-400 text-xs mb-3 break-all px-2">{shortenAddress(address)}</p>
            <ReputationBadge score={rep.score} count={rep.count} />
            <Separator className="bg-white/8 my-4" />
            <div className="flex flex-wrap gap-1.5 justify-center">
              {(profile?.skills ?? []).length > 0 ? profile!.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-white/8 text-slate-300 text-xs border border-white/8">
                  {skill}
                </Badge>
              )) : (
                <p className="text-slate-600 text-xs">No skills listed</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job history */}
        <div className="md:col-span-2 space-y-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-200 text-base flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Job History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(profile?.jobHistory ?? []).length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No completed jobs yet.</p>
              ) : (
                profile!.jobHistory.map((j) => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/6 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium">{j.title}</p>
                        <p className="text-slate-500 text-xs capitalize">{j.status}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[#dddddd] text-sm font-semibold shrink-0">
                      {j.amount.toLocaleString()} <span className="text-white/40 text-xs">XLM</span>
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Portfolio */}
          {freelancer && freelancer.portfolio.length > 0 && (
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-200 text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {freelancer.portfolio.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/3 border border-white/6 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-slate-200 text-sm font-medium">{item.title}</p>
                      <Badge className="bg-white/8 text-slate-300 text-xs border border-white/8 shrink-0">{item.tag}</Badge>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
