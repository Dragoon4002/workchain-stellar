'use client'

import { useWalletStore } from '@/store/wallet'
import { shortenAddress } from '@/lib/wallet'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wallet, LogOut, Copy } from 'lucide-react'

export function WalletConnect() {
  const { address, connecting, connect, disconnect } = useWalletStore()

  if (!address) {
    return (
      <Button
        onClick={connect}
        disabled={connecting}
        variant="tile"
        className="font-semibold"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" className="border-slate-600 text-white font-mono hover:bg-slate-800" />}
      >
        <Wallet className="w-4 h-4 mr-2 text-[#dddddd]" />
        {shortenAddress(address)}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glass">
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(address)}
          className="text-white hover:bg-white/8 cursor-pointer"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={disconnect}
          className="text-red-400 hover:bg-white/8 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
