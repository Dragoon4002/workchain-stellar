import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'WorkChain — Decentralized Freelance on Stellar',
  description: 'Work without borders. Get paid without banks.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
