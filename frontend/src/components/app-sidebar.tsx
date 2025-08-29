'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, LayoutGroup } from 'motion/react'
import { useWalletStore } from '@/store/wallet'
import { shortenAddress } from '@/lib/wallet'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Zap, LayoutDashboard, Compass, PlusSquare,
  FileText, User, LogOut, Copy, Wallet, MessageSquare, Users, Briefcase, BarChart2,
} from 'lucide-react'

const NAV = [
  {
    section: 'Main',
    items: [
      { href: '/app/dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
      { href: '/app/explore',     label: 'Explore Jobs',   icon: Compass },
      { href: '/app/freelancers', label: 'Find Talent',    icon: Users },
      { href: '/app/jobs/new',    label: 'Post a Job',     icon: PlusSquare },
    ],
  },
  {
    section: 'Work',
    items: [
      { href: '/app/jobs',      label: 'My Jobs',      icon: Briefcase },
      { href: '/app/contracts', label: 'Contracts',    icon: FileText },
      { href: '/app/messages',  label: 'Messages',     icon: MessageSquare },
      { href: '/app/profile',   label: 'My Profile',   icon: User },
    ],
  },
  {
    section: 'DevOps',
    items: [
      { href: '/app/admin', label: 'Analytics', icon: BarChart2 },
    ],
  },
]

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-full w-full transition-colors duration-150 hover:bg-white/[0.04]"
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.9 }}
          className="absolute inset-0 rounded-full bg-white/8 border border-white/10"
        />
      )}
      <div className={`
        relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors
        ${active ? 'bg-white/15' : 'bg-white/5'}
      `}>
        <Icon className={`w-[18px] h-[18px] ${active ? 'text-white' : 'text-white/40'}`} />
      </div>
      <span className={`relative text-sm font-medium transition-colors ${active ? 'text-white' : 'text-white/40'}`}>
        {label}
      </span>
    </Link>
  )
}

function WalletSection() {
  const { address, connecting, connect, disconnect } = useWalletStore()

  if (!address) {
    return (
      <Button
        onClick={connect}
        disabled={connecting}
        variant="tile"
        className="w-full rounded-full font-semibold"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left">
            <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center shrink-0">
              <Wallet className="w-[18px] h-[18px] text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/40 leading-none mb-0.5">Connected</p>
              <p className="text-sm font-mono text-white/40 truncate">{shortenAddress(address)}</p>
            </div>
          </button>
        }
      />
      <DropdownMenuContent side="top" align="start" className="w-52 glass mb-2">
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(address)}
          className="text-white/40 hover:bg-white/8 cursor-pointer"
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

function LogOutButton() {
  const { disconnect } = useWalletStore()
  return (
    <button
      onClick={disconnect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-full w-full bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center shrink-0">
        <LogOut className="w-[18px] h-[18px] text-white/40" />
      </div>
      <span className="text-sm font-medium text-white/40">Log Out</span>
    </button>
  )
}

export function AppSidebar() {
  const { address } = useWalletStore()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[20vw] flex flex-col z-40 bg-[#161616] border-r border-white/6">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#dddddd] flex items-center justify-center shadow-lg shadow-white/10 shrink-0">
            <Zap className="w-[18px] h-[18px] text-black" />
          </div>
          <span className="text-base font-bold text-white">WorkChain</span>
        </Link>
      </div>

      {/* Nav */}
      <LayoutGroup>
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <p className="px-3 mb-2 text-xs font-medium text-white/40 tracking-wide">{section}</p>
              <div className="space-y-1">
                {items.map((item) => <NavItem key={item.href} {...item} />)}
              </div>
            </div>
          ))}
        </nav>
      </LayoutGroup>

      {/* Bottom */}
      <div className="px-3 pb-5 pt-3 border-t border-white/6 space-y-2">
        {address ? <WalletSection /> : null}
        {address
          ? <LogOutButton />
          : (
            <Button
              onClick={() => useWalletStore.getState().connect()}
              variant="tile"
              className="w-full rounded-full font-semibold"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )
        }
      </div>
    </aside>
  )
}
