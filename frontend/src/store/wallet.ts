'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StellarWalletsKit } from '@/lib/wallet'

interface WalletStore {
  address: string | null
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      address: null,
      connecting: false,
      connect: async () => {
        set({ connecting: true })
        try {
          const { address } = await StellarWalletsKit.authModal()
          set({ address, connecting: false })
        } catch {
          set({ connecting: false })
        }
      },
      disconnect: () => set({ address: null }),
    }),
    {
      name: 'workchain-wallet',
      partialize: (state) => ({ address: state.address }),
    }
  )
)
