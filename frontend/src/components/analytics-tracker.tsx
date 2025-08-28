'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useWalletStore } from '@/store/wallet'
import { trackPageView, trackSession, trackWalletConnect } from '@/lib/analytics'

export function AnalyticsTracker() {
  const pathname = usePathname()
  const { address } = useWalletStore()
  const sessionTracked = useRef(false)
  const prevAddress = useRef<string | null>(null)

  useEffect(() => {
    if (!sessionTracked.current) {
      trackSession()
      sessionTracked.current = true
    }
  }, [])

  useEffect(() => {
    trackPageView(pathname, address)
  }, [pathname, address])

  useEffect(() => {
    if (address && address !== prevAddress.current) {
      trackWalletConnect(address)
      prevAddress.current = address
    }
  }, [address])

  return null
}
