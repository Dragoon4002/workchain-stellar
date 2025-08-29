'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { FeedbackWidget } from './feedback-widget'

interface State {
  error: Error | null
  showWidget: boolean
  dismissed: boolean
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null, showWidget: false, dismissed: false }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error) {
    // fire-and-forget auto-report
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'error',
        message: `[Auto] ${error.message}`,
        error: error.stack ?? error.message,
        page: window.location.pathname,
      }),
    }).catch(() => {})
  }

  render() {
    const { error, showWidget, dismissed } = this.state

    return (
      <>
        {this.props.children}

        {/* Edge toast — appears on any runtime error */}
        {error && !dismissed && !showWidget && (
          <div className="fixed bottom-6 left-6 z-[60] flex items-center gap-3 bg-[#0d0d0d] border border-red-500/30 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-sm">
            <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold">Something went wrong</p>
              <p className="text-white/40 text-[10px] font-mono truncate">{error.message}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => this.setState({ showWidget: true })}
                className="text-[10px] font-mono text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap"
              >
                Inform the dev →
              </button>
              <button
                onClick={() => this.setState({ dismissed: true })}
                className="text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors text-center"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Feedback modal pre-filled with error */}
        {showWidget && error && (
          <FeedbackWidget
            forceOpen
            prefillType="error"
            prefillError={error.message}
            onClose={() => this.setState({ showWidget: false, dismissed: true })}
          />
        )}
      </>
    )
  }
}
