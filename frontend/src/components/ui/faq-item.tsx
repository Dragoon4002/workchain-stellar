'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { AccordionItemData } from './card-split-accordian'

export function FaqItem({ item }: { item: AccordionItemData }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="text-white/30 font-mono text-xs w-5 shrink-0">{String(item.id).padStart(2, '0')}</span>
          <span className="text-white text-base font-medium group-hover:text-white/80 transition-colors">{item.title}</span>
        </div>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="text-white/40 text-xl font-light shrink-0 leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="overflow-hidden"
          >
            <p className="pt-4 pl-8 text-white/50 text-sm leading-relaxed font-mono">
              {item.content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
