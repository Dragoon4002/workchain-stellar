import { MOCK_PROFILES } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { ReputationBadge } from '@/components/reputation-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { CheckCircle } from 'lucide-react'

export default async function ProfilePage({ params }: { params: Promise<{ wallet: string }> }) {
  const { wallet } = await params
  const profile = MOCK_PROFILES[wallet] ?? {
    walletAddress: wallet,
    reputation: 0,
    totalJobs: 0,
    skills: [],
    jobHistory: [],
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="bg-slate-800/50 border-slate-700 h-fit">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-amber-500/30">
              <Image
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${wallet}`}
                alt="Avatar"
                width={80}
                height={80}
                className="w-full h-full"
              />
            </div>
            <p className="font-mono text-slate-400 text-sm mb-3">{shortenAddress(wallet)}</p>
            <ReputationBadge score={profile.reputation} count={profile.totalJobs} />
            <Separator className="bg-slate-700 my-4" />
            <div className="flex flex-wrap gap-1.5 justify-center">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-slate-700 text-slate-300 text-xs">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job history */}
        <div className="md:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 text-base">Job History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.jobHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">No completed jobs yet.</p>
              ) : (
                profile.jobHistory.map((j) => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-slate-200 text-sm">{j.title}</span>
                    </div>
                    <span className="font-mono text-amber-500 text-sm font-semibold">{j.amount.toLocaleString()} XLM</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
