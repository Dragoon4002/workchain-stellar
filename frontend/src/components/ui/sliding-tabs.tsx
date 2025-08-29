'use client'

import { useState, useEffect, type FC } from 'react'
import { motion, LayoutGroup } from 'motion/react'

export interface TabItem {
  id: string
  label: string
}

interface SlidingTabsProps {
  tabs: TabItem[]
  defaultActiveId?: string
  onChange?: (id: string) => void
  className?: string
}

export const SlidingTabs: FC<SlidingTabsProps> = ({
  tabs,
  defaultActiveId,
  onChange,
  className = '',
}) => {
  const [active, setActive] = useState<string>(defaultActiveId ?? tabs[0]?.id)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  const handleChange = (id: string) => {
    setActive(id)
    onChange?.(id)
  }

  if (!mounted) return null

  return (
    <LayoutGroup>
      <nav
        className={`relative flex items-center gap-0.5 p-1 rounded-full border border-white/12 bg-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleChange(tab.id)}
              className="relative px-4 py-2 rounded-full outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="workchain-active-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.9 }}
                  className="absolute inset-0 rounded-full bg-white/12 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_0_0_1px_rgba(255,255,255,0.08)]"
                />
              )}
              <motion.span
                layout="position"
                className={`relative z-10 text-sm font-semibold transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {tab.label}
              </motion.span>
            </button>
          )
        })}
      </nav>
    </LayoutGroup>
  )
}
