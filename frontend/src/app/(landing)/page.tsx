import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { FaqItem } from '@/components/ui/faq-item'
import { Card, CardContent } from '@/components/ui/card'
import {
  Shield,
  Zap,
  Lock,
  Star,
  Code2,
  Palette,
  FileText,
  Megaphone,
  Smartphone,
  Camera,
  Layers,
  Search,
  Check,
  HelpCircle,
} from 'lucide-react'
import { AccordionApp, type AccordionItemData } from '@/components/ui/card-split-accordian'
import { MOCK_JOBS, MOCK_FREELANCERS } from '@/lib/mock-data'
import { Wallet, AlertTriangle, Coins, Briefcase } from 'lucide-react'

const FAQ_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    title: 'How does the escrow work?',
    icon: <Lock className="size-3.5 md:size-4" />,
    content:
      "When a client hires a freelancer, funds are locked in a Soroban smart contract on Stellar. Neither party can access the funds unilaterally — the client releases each milestone as work is approved. If there's a dispute, a 2-of-3 multisig arbitration resolves it on-chain.",
  },
  {
    id: 2,
    title: 'What wallet do I need?',
    icon: <Wallet className="size-3.5 md:size-4" />,
    content:
      'Any Stellar-compatible wallet works — Freighter is recommended. Connect once and your wallet address becomes your identity on WorkChain. No email, no password, no KYC.',
  },
  {
    id: 3,
    title: 'What are the platform fees?',
    icon: <Coins className="size-3.5 md:size-4" />,
    content:
      'WorkChain charges ~0% platform fees. You only pay the Stellar network transaction fee, which is a fraction of a cent. Compare that to the 5–20% cut taken by traditional freelance platforms.',
  },
  {
    id: 4,
    title: 'How are disputes resolved?',
    icon: <AlertTriangle className="size-3.5 md:size-4" />,
    content:
      'Either party can raise a dispute, which locks the escrow and triggers arbitration. A server key acts as the third party in the 2-of-3 multisig — it reviews the case and calls resolve_dispute() on-chain. The ruling is final and automatic.',
  },
  {
    id: 5,
    title: 'How do milestones work?',
    icon: <FileText className="size-3.5 md:size-4" />,
    content:
      "Jobs are broken into milestones with individual XLM amounts. Freelancers submit proof of work (a URL) for each milestone. The client approves, and funds release instantly to the freelancer's wallet. Partial payments, zero waiting.",
  },
]

const CATEGORIES = [
  { label: 'Development', icon: Code2 },
  { label: 'Design', icon: Palette },
  { label: 'Security', icon: Shield },
  { label: 'Writing', icon: FileText },
  { label: 'Marketing', icon: Megaphone },
  { label: 'Mobile', icon: Smartphone },
  { label: 'Photography', icon: Camera },
  { label: 'Consulting', icon: Layers },
]

const QUICK_FILTERS = ['Development', 'Design', 'Security', 'Writing', 'Marketing', 'Mobile']

const TRUST_ITEMS = [
  { icon: Shield, label: 'Trustless escrow', desc: 'Funds locked on-chain, released per milestone.' },
  { icon: Zap, label: '< 5s payments', desc: 'Stellar settles in seconds, not days.' },
  { icon: Lock, label: 'Non-custodial', desc: 'Your keys, your funds, always.' },
  { icon: Star, label: 'On-chain reputation', desc: 'Immutable track record, no platform lock-in.' },
]

export default function HomePage() {
  const freelancers = MOCK_FREELANCERS.slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* ── 1. HERO ── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-black flex flex-col">
        {/* CSS grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Scattered + crosses */}
        {[
          { top: '12%', left: '8%' }, { top: '22%', left: '78%' },
          { top: '55%', left: '5%' }, { top: '68%', left: '88%' },
          { top: '80%', left: '22%' }, { top: '15%', left: '55%' },
          { top: '40%', left: '92%' }, { top: '75%', left: '60%' },
        ].map((pos, i) => (
          <span
            key={i}
            className="absolute text-white/40 text-xl font-light pointer-events-none select-none"
            style={{ top: pos.top, left: pos.left }}
          >
            +
          </span>
        ))}

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-8 py-5">
          <span className="text-white/50 text-xs uppercase tracking-[0.25em] font-mono">WorkChain · 2026</span>
          <div className="flex items-center gap-8">
            <Link href="/app/explore" className="text-white/60 text-xs uppercase tracking-[0.2em] font-mono hover:text-white transition-colors">Explore</Link>
            <Link href="/app/freelancers" className="text-white/60 text-xs uppercase tracking-[0.2em] font-mono hover:text-white transition-colors">Talent</Link>
            <Link href="/app/jobs/new" className="text-white/60 text-xs uppercase tracking-[0.2em] font-mono hover:text-white transition-colors">Post Job</Link>
          </div>
          <span className="text-white/30 text-xs uppercase tracking-[0.25em] font-mono">Built on Stellar</span>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-white/50 text-sm uppercase tracking-[0.3em] font-mono mb-6">Decentralized Freelance Marketplace</p>
          <h1
            className="text-[clamp(4rem,14vw,11rem)] font-bold leading-none tracking-tight text-white mb-4"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
          >
            WorkChain
          </h1>
          <p className="text-white/50 text-sm uppercase tracking-[0.3em] font-mono mb-10">No Fees · No Banks · No Middlemen</p>
          <div className="flex items-center gap-4">
            <Link
              href="/app/explore"
              className="text-sm uppercase tracking-[0.2em] font-mono text-black bg-white px-8 py-3.5 hover:bg-white/90 transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              href="/app/jobs/new"
              className="text-sm uppercase tracking-[0.2em] font-mono text-white/70 border border-white/30 px-8 py-3.5 hover:border-white/60 hover:text-white transition-colors"
            >
              Post a Job
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 flex items-center justify-between px-8 py-5">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-mono">Available for hire</p>
            <p className="text-white/40 text-xs font-mono">31 freelancers · 8 open jobs</p>
          </div>
          <span className="text-white/40 text-xs uppercase tracking-[0.3em] font-mono">↓ scroll</span>
          <span className="text-white/40 text-xs font-mono">© 2026 WorkChain. All rights reserved.</span>
        </div>
      </section>

      {/* ── 3. POPULAR JOB CATEGORIES ── */}
      <section className="py-16 px-4 border-t border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-1">Marketplace</p>
              <h2 className="font-serif italic text-4xl text-white">Popular Categories</h2>
            </div>
            <Link href="/app/explore" className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
              Browse all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Development', icon: Code2, desc: 'Smart contracts, dApps, APIs, full-stack', count: 142, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { label: 'Design', icon: Palette, desc: 'UI/UX, branding, motion, product design', count: 87, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { label: 'Security', icon: Shield, desc: 'Audits, pen testing, threat modeling', count: 34, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
              { label: 'Writing', icon: FileText, desc: 'Whitepapers, docs, content, copywriting', count: 56, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Marketing', icon: Megaphone, desc: 'Growth, community, social, campaigns', count: 63, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
              { label: 'Mobile', icon: Smartphone, desc: 'iOS, Android, React Native, Flutter', count: 45, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              { label: 'Consulting', icon: Layers, desc: 'Strategy, tokenomics, product, advisory', count: 29, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { label: 'Photography', icon: Camera, desc: 'NFT assets, product shoots, video', count: 18, color: 'text-white/60', bg: 'bg-white/8 border-white/10' },
            ].map(({ label, icon: Icon, desc, count, color, bg }) => (
              <Link
                key={label}
                href={`/app/explore?category=${label}`}
                className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/16 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="font-serif italic text-white text-lg leading-tight">{label}</p>
                  <p className="text-xs text-white/30 font-mono mt-0.5">{desc}</p>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className={`text-xs font-mono font-semibold ${color}`}>{count} jobs</span>
                  <span className="text-white/20 text-xs group-hover:text-white/50 transition-colors">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. TRUST STRIP ── */}
      <section className="py-16 px-4 border-t border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Why WorkChain</p>
            <h2 className="font-serif italic text-4xl text-white mb-2">Why thousands choose WorkChain</h2>
            <p className="text-white/40 font-mono text-sm">The math is simple. The code is auditable.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-xl p-5 flex flex-col gap-3 hover:border-white/16 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-white/40 font-mono">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PRO BANNER ── */}
      <section className="py-20 px-4 border-t border-white/8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-3 block">
                Soroban Escrow
              </span>
              <h2 className="text-4xl font-bold text-white mb-5 leading-tight">
                Trustless escrow.
                <br />
                <span className="text-emerald-400">Your rules.</span>
              </h2>
              <ul className="space-y-3 mb-8">
                {[
                  'Neither party can cheat — the contract enforces it',
                  'Disputes resolved on-chain via 2-of-3 multisig',
                  'Funds released automatically per milestone',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-white/60 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4">
                <Link
                  href="/app/explore"
                  className="text-sm uppercase tracking-[0.2em] font-mono text-black bg-white px-8 py-3.5 hover:bg-white/90 transition-colors"
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/app/jobs/new"
                  className="text-sm uppercase tracking-[0.2em] font-mono text-white/70 border border-white/30 px-8 py-3.5 hover:border-white/60 hover:text-white transition-colors"
                >
                  Post a Job
                </Link>
              </div>
            </div>

            {/* Right — milestone progress bars */}
            <div className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-2xl p-6 space-y-4">
              <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-2">Escrow milestones</p>
              {[
                { label: 'UI wireframes & design', amount: 500, status: 'approved' },
                { label: 'Core components', amount: 1000, status: 'approved' },
                { label: 'Horizon API integration', amount: 750, status: 'active' },
                { label: 'Testing & deployment', amount: 250, status: 'pending' },
              ].map(({ label, amount, status }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{label}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400">{amount} XLM</span>
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[10px] font-medium',
                          status === 'approved'
                            ? 'bg-emerald-400/15 text-emerald-400'
                            : status === 'active'
                            ? 'bg-blue-400/15 text-blue-400'
                            : 'bg-white/8 text-white/30',
                        ].join(' ')}
                      >
                        {status}
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={[
                        'h-full rounded-full transition-all',
                        status === 'approved'
                          ? 'bg-emerald-400 w-full'
                          : status === 'active'
                          ? 'bg-blue-400 w-1/2'
                          : 'w-0',
                      ].join(' ')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FREELANCER SPOTLIGHT ── */}
      <section className="py-16 px-4 border-t border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-1">Talent</p>
              <h2 className="font-serif italic text-4xl text-white">Meet the talent</h2>
              <p className="text-white/40 font-mono text-sm mt-1">Top-rated freelancers available now</p>
            </div>
            <Link href="/app/freelancers" className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {freelancers.map((fl) => (
              <div key={fl.walletAddress} className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/16 transition-colors">
                <div className="flex items-center gap-3">
                  <Image
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${fl.walletAddress}`}
                    alt={fl.name}
                    width={44}
                    height={44}
                    className="rounded-full bg-white/10"
                  />
                  <div>
                    <p className="font-serif italic text-base text-white">{fl.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={[
                            'w-3 h-3',
                            i < Math.round(fl.reputation) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20',
                          ].join(' ')}
                        />
                      ))}
                      <span className="text-xs text-white/30 ml-1">{fl.reputation}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/40 leading-relaxed font-mono">{fl.tagline}</p>
                <div className="flex flex-wrap gap-1.5">
                  {fl.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] text-white/60 bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                  <span className="font-mono text-emerald-400 text-sm font-semibold">${fl.hourlyRate}/hr</span>
                  <Link
                    href={`/app/profile/${fl.walletAddress}`}
                    className={buttonVariants({ variant: 'tile', size: 'sm' })}
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FULL-WIDTH CTA BANNER ── */}
      <section className="py-16 px-4 border-t border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-2xl px-8 py-14 text-center">
            <h2 className="text-4xl font-bold text-white mb-3">
              Freelance services at your fingertips
            </h2>
            <p className="text-white/40 mb-8 text-lg">No fees. No banks. No middlemen.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/app/explore"
                className="text-sm uppercase tracking-[0.2em] font-mono text-black bg-white px-8 py-3.5 hover:bg-white/90 transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                href="/app/jobs/new"
                className="text-sm uppercase tracking-[0.2em] font-mono text-white/70 border border-white/30 px-8 py-3.5 hover:border-white/60 hover:text-white transition-colors"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 border-t border-white/8 bg-black">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-white/40 uppercase tracking-[0.3em] font-mono text-center mb-2">Questions</p>
          <h2 className="text-4xl font-bold text-white text-center mb-12" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}>
            FAQ
          </h2>
          <div className="divide-y divide-white/8">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FOOTER ── */}
      <footer className="border-t border-white/8 bg-black px-4 pt-12 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-white font-bold text-sm">WorkChain</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed">
                Decentralized freelance marketplace built on Stellar. Work on your terms.
              </p>
            </div>

            {/* For Freelancers */}
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">For Freelancers</p>
              <ul className="space-y-2">
                {[
                  { label: 'Browse Jobs', href: '/app/explore' },
                  { label: 'My Profile', href: '/app/profile' },
                  { label: 'My Contracts', href: '/app/contracts' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Clients */}
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">For Clients</p>
              <ul className="space-y-2">
                {[
                  { label: 'Post a Job', href: '/app/jobs/new' },
                  { label: 'Find Talent', href: '/app/explore' },
                  { label: 'How it works', href: '/#how-it-works' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Platform</p>
              <ul className="space-y-2">
                {[
                  { label: 'FAQ', href: '/#faq' },
                  { label: 'Security', href: '/#security' },
                  { label: 'Stellar Network', href: 'https://stellar.org' },
                  { label: 'Twitter', href: '#' },
                  { label: 'GitHub', href: '#' },
                  { label: 'Discord', href: '#' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 pt-5 text-center">
            <p className="text-xs text-white/20">© 2026 WorkChain. Built on Stellar.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
