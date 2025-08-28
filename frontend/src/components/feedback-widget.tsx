'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useWalletStore } from '@/store/wallet'
import { motion, AnimatePresence } from 'motion/react'
import { MessageSquare, X, Star, Send, Loader2 } from 'lucide-react'

interface FeedbackWidgetProps {
  prefillType?: 'feedback' | 'error'
  prefillError?: string
  onClose?: () => void
  forceOpen?: boolean
}

export function FeedbackWidget({ prefillType, prefillError, onClose, forceOpen }: FeedbackWidgetProps = {}) {
  const [open, setOpen] = useState(forceOpen ?? false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [message, setMessage] = useState(prefillError ? `Error: ${prefillError}` : '')
  const [type, setType] = useState<'feedback' | 'error'>(prefillType ?? 'feedback')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const pathname = usePathname()
  const { address } = useWalletStore()

  function close() {
    setOpen(false)
    onClose?.()
  }

  async function submit() {
    if (!message.trim()) return
    setSending(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, rating: rating || null, message, wallet: address, page: pathname, error: prefillError ?? null }),
      })
      setSent(true)
      setTimeout(close, 1800)
    } catch {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating trigger — hidden when forced open (error toast controls it) */}
      {!forceOpen && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#111] border border-white/12 rounded-full text-white/60 text-xs font-mono hover:text-white hover:border-white/24 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Feedback
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={close}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="fixed bottom-20 right-6 z-50 w-80 bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/30 mb-0.5">
                    {type === 'error' ? 'Report Issue' : 'Feedback'}
                  </p>
                  <p className="text-white text-sm font-medium">
                    {type === 'error' ? 'Help us fix this fast' : 'Share your thoughts'}
                  </p>
                </div>
                <button onClick={close} className="text-white/30 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sent ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-emerald-400 font-mono text-sm mb-1">✓ Received</p>
                  <p className="text-white/40 text-xs">
                    {type === 'error' ? "We'll fix it within 12 hours." : 'Thanks for the feedback!'}
                  </p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {/* Type toggle */}
                  <div className="flex gap-2">
                    {(['feedback', 'error'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                          type === t ? 'bg-white/10 border-white/20 text-white' : 'border-white/8 text-white/30 hover:text-white/60'
                        }`}
                      >
                        {t === 'feedback' ? 'Feedback' : 'Bug / Error'}
                      </button>
                    ))}
                  </div>

                  {/* Star rating */}
                  {type === 'feedback' && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setRating(n)}
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              n <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={type === 'error' ? 'Describe what happened…' : 'What can we improve?'}
                    rows={3}
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 resize-none outline-none focus:border-white/20 font-mono"
                  />

                  {/* Page info */}
                  <p className="text-[10px] text-white/20 font-mono">Page: {pathname}</p>

                  <button
                    onClick={submit}
                    disabled={sending || !message.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-sm font-mono font-semibold hover:bg-white/90 disabled:opacity-40 transition-all"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {type === 'error' ? 'Report Issue' : 'Send Feedback'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
