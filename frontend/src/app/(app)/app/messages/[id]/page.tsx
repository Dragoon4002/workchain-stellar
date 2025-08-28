'use client'

import { use, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Lock, SendHorizontal, ChevronLeft, Shield } from 'lucide-react'
import { MOCK_ROOMS, MOCK_CONTRACTS, Message } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { address } = useWalletStore()
  const me = address ?? 'GYOUR_ADDRESS_HERE'
  const room = MOCK_ROOMS.find((r) => r.id === id)
  if (!room) notFound()

  const isFreelancer = room.freelancerAddress === me
  const otherAddress = isFreelancer ? room.clientAddress : room.freelancerAddress

  const [messages, setMessages] = useState<Message[]>(room.messages)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        senderId: me,
        content: text,
        timestamp: new Date().toISOString(),
        encrypted: true,
      },
    ])
    setInput('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Chat column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="glass border-b border-white/8 px-4 py-3 flex items-center gap-3 shrink-0">
          <Link href="/app/messages" className="text-slate-400 hover:text-[#dddddd] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#dddddd] text-sm truncate">{room.jobTitle}</p>
            <p className="text-xs text-slate-500 font-mono">{shortenAddress(otherAddress)}</p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 gap-1">
            <Lock className="w-3 h-3" />
            Encrypted
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => {
            const mine = msg.senderId === me
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl px-3 py-2 ${mine ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-200'}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Lock className="w-2.5 h-2.5 text-slate-600" />
                    <span className="text-xs text-slate-500">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="glass border-t border-white/8 px-4 py-3 flex items-end gap-2 shrink-0">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message…"
            className="flex-1 resize-none bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-white/20 max-h-32 overflow-y-auto"
          />
          <Button
            onClick={send}
            size="icon"
            className="bg-[#dddddd] hover:bg-white text-black shrink-0"
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sidebar — desktop only */}
      <div className="hidden lg:block w-72 shrink-0 glass border-l border-white/8 p-5 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <Shield className="w-4 h-4 text-emerald-400" />
          Contract Info
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Contract ID</p>
            <p className="font-mono text-slate-300 text-xs break-all">{room.contractId}</p>
          </div>
          {(() => {
            const contract = MOCK_CONTRACTS.find((c) => c.id === room.contractId)
            if (!contract) return null
            return (
              <>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Total Amount</p>
                  <p className="font-mono text-[#dddddd] font-semibold">{contract.totalAmount.toLocaleString()} XLM</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Locked</p>
                  <p className="font-mono text-[#dddddd]">{contract.lockedAmount.toLocaleString()} XLM</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Status</p>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 capitalize">{contract.status}</Badge>
                </div>
                <Link
                  href={`/app/contracts/${room.contractId}`}
                  className="block text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-2"
                >
                  View Contract →
                </Link>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
