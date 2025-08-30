'use client'

import { use, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Lock, SendHorizontal, ChevronLeft } from 'lucide-react'
import { MOCK_JOBS } from '@/lib/mock-data'
import { shortenAddress } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fetchThreads, fetchMessages, sendMessage, type Thread, type Msg } from '@/lib/messages'

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { address } = useWalletStore()
  const me = address ?? 'GYOUR_ADDRESS_HERE'

  const [thread, setThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([fetchThreads(me), fetchMessages(id)]).then(([threads, msgs]) => {
      const t = threads.find((t) => t.id === id) ?? null
      setThread(t)
      setMessages(msgs)
      setLoading(false)
    })
  }, [id, me])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!loading && !thread) notFound()

  const other = thread?.participants.find((p) => p !== me) ?? ''
  const job = thread ? MOCK_JOBS.find((j) => j.id === thread.job_id) : null

  async function send() {
    const text = input.trim()
    if (!text || !thread) return

    // optimistic
    const optimistic: Msg = {
      id: `opt-${Date.now()}`,
      thread_id: id,
      sender: me,
      body: text,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, optimistic])
    setInput('')

    const result = await sendMessage({ thread_id: id, sender: me, body: text })
    if (result) {
      // replace optimistic with server msg
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? result.msg : m)))
      setThread(result.thread)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="glass border-b border-white/8 px-4 py-3 flex items-center gap-3 shrink-0">
          <Link href="/app/messages" className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-serif italic text-white text-sm truncate">
              {job?.title ?? (thread ? `Job #${thread.job_id}` : '…')}
            </p>
            <p className="text-xs text-white/30 font-mono">{other ? shortenAddress(other) : '…'}</p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 gap-1">
            <Lock className="w-3 h-3" />
            Encrypted
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => {
            const mine = msg.sender === me
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl px-3 py-2 ${mine ? 'bg-white/10 text-white' : 'bg-white/5 text-white'}`}>
                  <p className="text-sm leading-relaxed">{msg.body}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Lock className="w-2.5 h-2.5 text-white/20" />
                    <span className="text-xs text-white/30">{formatTime(msg.timestamp)}</span>
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
            className="flex-1 resize-none bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 max-h-32 overflow-y-auto"
          />
          <Button onClick={send} size="icon" variant="tile" className="shrink-0">
            <SendHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
