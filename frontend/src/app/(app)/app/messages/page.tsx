'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, MessageSquare, ChevronRight } from 'lucide-react'
import { MOCK_JOBS } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'
import { fetchThreads, type Thread } from '@/lib/messages'

function relativeTime(ms: number): string {
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function MessagesPage() {
  const { address } = useWalletStore()
  const me = address ?? 'GYOUR_ADDRESS_HERE'
  const [threads, setThreads] = useState<Thread[]>([])

  useEffect(() => {
    fetchThreads(me).then(setThreads)
  }, [me])

  const sorted = [...threads].sort((a, b) => b.updated_at - a.updated_at)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/30 mb-1">Inbox</p>
        <h1 className="font-serif italic text-3xl text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-white/40" />
          Messages
        </h1>
        <p className="text-xs text-emerald-400 mt-1">End-to-end encrypted</p>
      </div>

      {sorted.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center text-white/40 flex flex-col items-center gap-3">
          <MessageSquare className="w-8 h-8 text-white/20" />
          <p>No conversations yet. Hire a freelancer or get hired to start chatting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((thread) => {
            const other = thread.participants.find((p) => p !== me) ?? thread.participants[0]
            const job = MOCK_JOBS.find((j) => j.id === thread.job_id)
            return (
              <Link key={thread.id} href={`/app/messages/${thread.id}`}>
                <div className="bg-gradient-to-br from-[#080d1a] to-black border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-sm truncate">
                        {job?.title ?? `Job #${thread.job_id}`}
                      </span>
                      <span className="text-xs text-white/30 ml-2 shrink-0">
                        {relativeTime(thread.updated_at)}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-white/40 mb-1.5">{shortenAddress(other)}</p>
                    <p className="text-xs text-white/30 truncate">{thread.last_message}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
