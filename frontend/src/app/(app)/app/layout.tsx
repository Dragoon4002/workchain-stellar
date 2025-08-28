import { AppSidebar } from '@/components/app-sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-orbs">
      <AppSidebar />
      <main className="flex-1 ml-[20vw] min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
