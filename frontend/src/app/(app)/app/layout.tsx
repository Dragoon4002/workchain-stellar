import { AppSidebar } from '@/components/app-sidebar'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import { FeedbackWidget } from '@/components/feedback-widget'
import { ErrorBoundary } from '@/components/error-boundary'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-orbs">
      <AppSidebar />
      <main className="flex-1 ml-[20vw] min-h-screen overflow-y-auto">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <AnalyticsTracker />
      <FeedbackWidget />
    </div>
  )
}
