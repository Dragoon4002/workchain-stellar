'use client'

import { useEffect, useState } from 'react'
import { shortenAddress } from '@/lib/wallet'
import { Users, Eye, MessageSquare, AlertTriangle, TrendingUp, Activity } from 'lucide-react'

interface WalletEntry { address: string; firstSeen: number; lastSeen: number; visits: number }
interface PageViewEntry { path: string; ts: number; wallet: string | null }
interface FeedbackEntry { id: number; ts: string; type: string; rating: number | null; message: string; wallet: string | null; page: string | null }

interface AnalyticsData {
  pageViews: PageViewEntry[]
  wallets: Record<string, WalletEntry>
  totalEvents: number
}

interface FeedbackData { entries: FeedbackEntry[] }

function StatCard({ icon: Icon, label, value, sub, color = 'text-white' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/30">{label}</p>
      </div>
      <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/30 font-mono mt-1">{sub}</p>}
    </div>
  )
}

function pathCounts(views: PageViewEntry[]): { path: string; count: number }[] {
  const map: Record<string, number> = {}
  for (const v of views) map[v.path] = (map[v.path] ?? 0) + 1
  return Object.entries(map).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count)
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [tab, setTab] = useState<'overview' | 'wallets' | 'pages' | 'feedback'>('overview')

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setAnalytics).catch(() => {})
    fetch('/api/feedback').then(r => r.json()).then(setFeedback).catch(() => {})
  }, [])

  const wallets = Object.values(analytics?.wallets ?? {}).sort((a, b) => b.lastSeen - a.lastSeen)
  const pages = pathCounts(analytics?.pageViews ?? [])
  const errors = feedback?.entries.filter(e => e.type === 'error') ?? []
  const userFeedback = feedback?.entries.filter(e => e.type === 'feedback') ?? []
  const avgRating = userFeedback.filter(e => e.rating).reduce((s, e, _, a) => s + (e.rating ?? 0) / a.length, 0)

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'wallets', label: `Wallets (${wallets.length})` },
    { id: 'pages', label: 'Pages' },
    { id: 'feedback', label: `Feedback (${feedback?.entries.length ?? 0})` },
  ] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-1">DevOps</p>
        <h1 className="font-serif italic text-4xl text-white">Analytics</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#111] border border-white/10 rounded-full w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
              tab === t.id ? 'bg-white/12 text-white' : 'text-white/30 hover:text-white/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Unique Wallets" value={wallets.length} color="text-blue-400" />
            <StatCard icon={Eye} label="Page Views" value={analytics?.pageViews.length ?? 0} color="text-white" />
            <StatCard icon={AlertTriangle} label="Errors Reported" value={errors.length} color="text-red-400" />
            <StatCard
              icon={Star}
              label="Avg Rating"
              value={avgRating ? avgRating.toFixed(1) + ' / 5' : '—'}
              sub={`${userFeedback.length} reviews`}
              color="text-yellow-400"
            />
          </div>

          {/* Recent activity feed */}
          <div className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-white/40" />
              <span className="text-white font-semibold text-sm">Recent Activity</span>
            </div>
            <div className="divide-y divide-white/4">
              {[...(analytics?.pageViews ?? [])].reverse().slice(0, 15).map((v, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-white/2 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span className="font-mono text-white/60 text-xs flex-1">{v.path}</span>
                  {v.wallet && <span className="font-mono text-white/30 text-xs">{shortenAddress(v.wallet)}</span>}
                  <span className="text-white/20 text-xs font-mono">{new Date(v.ts).toLocaleTimeString()}</span>
                </div>
              ))}
              {!analytics?.pageViews.length && (
                <p className="px-5 py-8 text-white/30 text-sm text-center font-mono">No activity yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wallets */}
      {tab === 'wallets' && (
        <div className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-white/6 text-xs font-mono uppercase tracking-widest text-white/30">
            <span>Wallet</span><span>First Seen</span><span>Last Seen</span><span>Visits</span>
          </div>
          {wallets.length === 0 && (
            <p className="px-6 py-12 text-white/30 text-sm text-center font-mono">No wallets connected yet.</p>
          )}
          {wallets.map((w, i) => (
            <div key={w.address} className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 border-b border-white/4 hover:bg-white/2 transition-colors ${i % 2 !== 0 ? 'bg-white/[0.01]' : ''}`}>
              <span className="font-mono text-white/80 text-sm">{w.address}</span>
              <span className="font-mono text-white/40 text-xs">{new Date(w.firstSeen).toLocaleDateString()}</span>
              <span className="font-mono text-white/40 text-xs">{new Date(w.lastSeen).toLocaleDateString()}</span>
              <span className="font-mono text-blue-400 text-sm font-semibold">{w.visits}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pages */}
      {tab === 'pages' && (
        <div className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/4">
            {pages.map(({ path, count }) => {
              const pct = Math.round((count / (analytics?.pageViews.length ?? 1)) * 100)
              return (
                <div key={path} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                  <span className="font-mono text-white/70 text-sm flex-1">{path}</span>
                  <div className="w-32 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono text-white/40 text-xs w-8 text-right">{count}</span>
                </div>
              )
            })}
            {!pages.length && <p className="px-6 py-12 text-white/30 text-sm text-center font-mono">No page views yet.</p>}
          </div>
        </div>
      )}

      {/* Feedback */}
      {tab === 'feedback' && (
        <div className="space-y-3">
          {!feedback?.entries.length && (
            <p className="text-white/30 text-sm text-center py-12 font-mono">No feedback yet.</p>
          )}
          {[...(feedback?.entries ?? [])].reverse().map((entry) => (
            <div
              key={entry.id}
              className={`bg-gradient-to-br from-[#080d1a] to-black border rounded-2xl p-5 space-y-2 ${
                entry.type === 'error' ? 'border-red-500/20' : 'border-white/8'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {entry.type === 'error'
                    ? <AlertTriangle className="w-4 h-4 text-red-400" />
                    : <MessageSquare className="w-4 h-4 text-blue-400" />}
                  <span className={`text-xs font-mono font-semibold ${entry.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                    {entry.type === 'error' ? 'Bug Report' : 'Feedback'}
                  </span>
                  {entry.rating && (
                    <span className="text-xs text-yellow-400 font-mono">{'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}</span>
                  )}
                </div>
                <span className="text-xs text-white/20 font-mono">{new Date(entry.ts).toLocaleString()}</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{entry.message}</p>
              <div className="flex gap-4 text-[10px] text-white/20 font-mono">
                {entry.wallet && <span>Wallet: {shortenAddress(entry.wallet)}</span>}
                {entry.page && <span>Page: {entry.page}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ponytail: Star not imported from lucide above — inline
function Star({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
}
