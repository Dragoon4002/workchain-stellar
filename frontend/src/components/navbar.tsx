'use client'

import Link from 'next/link'
import { WalletConnect } from './wallet-connect'
import { Zap } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              <span className="text-xl font-bold text-amber-500">WorkChain</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/explore" className="text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium">
                Explore
              </Link>
              <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium">
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/jobs/new"
              className="hidden sm:block text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Post a Job
            </Link>
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  )
}
