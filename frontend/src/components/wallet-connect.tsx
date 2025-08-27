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
        className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" className="border-slate-600 text-slate-200 font-mono hover:bg-slate-800" />}
      >
        <Wallet className="w-4 h-4 mr-2 text-amber-500" />
        {shortenAddress(address)}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-800 border-slate-700">
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(address)}
          className="text-slate-200 hover:bg-slate-700 cursor-pointer"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={disconnect}
          className="text-red-400 hover:bg-slate-700 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
