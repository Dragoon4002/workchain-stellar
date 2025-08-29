'use client'

import Link from 'next/link'
import { Lock, MessageSquare, ChevronRight } from 'lucide-react'
import { MOCK_ROOMS } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

export default function MessagesPage() {
  const { address } = useWalletStore()
  const me = address ?? 'GYOUR_ADDRESS_HERE'
  const rooms = MOCK_ROOMS.filter(
    (r) => r.clientAddress === me || r.freelancerAddress === me
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#dddddd] flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Messages
        </h1>
        <p className="text-xs text-emerald-400 mt-1">End-to-end encrypted</p>
      </div>

      {rooms.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center text-white/40 flex flex-col items-center gap-3">
          <MessageSquare className="w-8 h-8 text-white/20" />
          <p>No active conversations. Hire a freelancer or get hired to start chatting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room, idx) => {
            const isMe = room.freelancerAddress === me
            const otherAddress = isMe ? room.clientAddress : room.freelancerAddress
            const role = isMe ? 'Client' : 'Freelancer'
            const last = room.messages[room.messages.length - 1]
            const unread = idx === 0

            return (
              <Link key={room.id} href={`/app/messages/${room.id}`}>
                <div className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#dddddd] text-sm truncate">{room.jobTitle}</span>
                      <span className="text-xs text-white/30 ml-2 shrink-0">{last ? relativeTime(last.timestamp) : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs font-mono text-white/40">{shortenAddress(otherAddress)}</span>
                      <span className="text-xs text-white/20">·</span>
                      <span className="text-xs text-white/30">{role}</span>
                    </div>
                    {last && (
                      <p className="text-xs text-white/30 truncate">{last.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {unread && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
