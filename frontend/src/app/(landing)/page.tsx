import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Zap, Lock, Check, X, Briefcase, DollarSign } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/8 text-[#dddddd] border border-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Built on Stellar
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Work without borders.
            <br />
            <span className="text-[#dddddd]">Get paid without banks.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            The decentralized freelance marketplace on Stellar. No platform fees. No account bans. Instant milestone payments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/app/explore" className={buttonVariants({ size: 'lg', className: 'bg-[#dddddd] hover:bg-white text-black font-semibold px-8' })}>
              Browse Jobs
            </Link>
            <Link href="/app/jobs/new" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'border-slate-600 text-slate-200 hover:bg-slate-800 px-8' })}>
              Post a Job
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              '~0% platform fee',
              '< 5s payment finality',
              'Non-custodial',
            ].map((stat) => (
              <span key={stat} className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                {stat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-3">How it works</h2>
          <p className="text-slate-400 text-center mb-12">Three steps, fully on-chain, zero middlemen.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', icon: Briefcase, title: 'Post a Job', desc: 'Describe your project, set milestones and budget in XLM. Fully on-chain from day one.' },
              { num: '02', icon: Lock, title: 'Hire & Lock Escrow', desc: 'Accept a proposal and funds go into a Soroban escrow contract. Neither party can touch it unilaterally.' },
              { num: '03', icon: DollarSign, title: 'Approve & Release', desc: "Approve completed milestones and payment releases instantly to the freelancer's wallet." },
            ].map(({ num, icon: Icon, title, desc }) => (
              <Card key={num} className="glass">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-slate-700 mono mb-4">{num}</div>
                  <div className="w-10 h-10 rounded-lg bg-white/8 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#dddddd]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-3">Why WorkChain?</h2>
          <p className="text-slate-400 text-center mb-12">The math is simple.</p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-800 px-6 py-3 text-sm font-semibold">
              <span className="text-slate-400">Feature</span>
              <span className="text-[#dddddd] text-center">WorkChain</span>
              <span className="text-slate-500 text-center">Traditional</span>
            </div>
            {[
              { feature: 'Platform fees', us: '~0%', them: '5–20%' },
              { feature: 'Payment speed', us: '< 5 seconds', them: '3–7 days' },
              { feature: 'Account control', us: true, them: false },
              { feature: 'Dispute resolution', us: 'On-chain arbitration', them: 'Platform decides' },
              { feature: 'Data privacy', us: true, them: false },
            ].map(({ feature, us, them }, i) => (
              <div key={feature} className={`grid grid-cols-3 px-6 py-4 text-sm ${i % 2 === 0 ? 'bg-slate-800/30' : ''}`}>
                <span className="text-slate-300">{feature}</span>
                <span className="text-center">
                  {typeof us === 'boolean' ? (
                    <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                  ) : (
                    <span className="text-emerald-400 font-medium">{us}</span>
                  )}
                </span>
                <span className="text-center">
                  {typeof them === 'boolean' ? (
                    <X className="w-4 h-4 text-red-500 mx-auto" />
                  ) : (
                    <span className="text-slate-500">{them}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="w-12 h-12 text-[#dddddd] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to work on your terms?</h2>
          <p className="text-slate-400 mb-8">Join the freelancers and clients building the future of work.</p>
          <Button size="lg" className="bg-[#dddddd] hover:bg-white text-black font-semibold px-8">
            Connect Wallet to Start
          </Button>
        </div>
      </section>
    </div>
  )
}
