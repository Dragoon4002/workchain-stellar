'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { addReview } from '@/lib/reviews'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  reviewer: string
  freelancer: string
  job_id: string
  job_title: string
}

export function ReviewModal({ open, onClose, reviewer, freelancer, job_id, job_title }: Props) {
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!stars || !text.trim()) return
    setSubmitting(true)
    // persist client-side immediately; also fire the API route for validation
    addReview({ reviewer, freelancer, job_id, stars, text: text.trim(), job_title })
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reviewer, freelancer, job_id, stars, text: text.trim(), job_title }),
    }).catch(() => {})
    setSubmitting(false)
    setDone(true)
    setTimeout(() => { setDone(false); onClose() }, 1200)
  }

  const display = hovered || stars

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            key="card"
            className="glass border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-lg">Leave a Review</h2>
                <p className="text-white/40 text-xs mt-0.5">{job_title}</p>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {done ? (
              <motion.p
                className="text-emerald-400 text-center py-6 font-semibold"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                Review submitted ✓
              </motion.p>
            ) : (
              <>
                {/* Star picker */}
                <div
                  className="flex gap-1.5 mb-4"
                  onMouseLeave={() => setHovered(0)}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      className={`text-2xl transition-colors ${n <= display ? 'text-amber-400' : 'text-white/20'}`}
                      onMouseEnter={() => setHovered(n)}
                      onClick={() => setStars(n)}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    >
                      {n <= display ? '★' : '☆'}
                    </button>
                  ))}
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe your experience working with this freelancer…"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm resize-none placeholder:text-white/20 focus:outline-none focus:border-white/30 mb-4"
                />

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" className="text-white/40" onClick={onClose}>
                    Skip
                  </Button>
                  <Button
                    variant="tile"
                    className="font-semibold"
                    disabled={!stars || !text.trim() || submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
