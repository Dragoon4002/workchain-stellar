// Client-side fetch helpers for the messages API

export interface Thread {
  id: string
  job_id: string
  participants: [string, string]
  last_message: string
  updated_at: number
}

export interface Msg {
  id: string
  thread_id: string
  sender: string
  body: string
  timestamp: number
}

export async function fetchThreads(wallet: string): Promise<Thread[]> {
  const res = await fetch(`/api/messages?wallet=${encodeURIComponent(wallet)}`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchMessages(threadId: string): Promise<Msg[]> {
  const res = await fetch(`/api/messages/${encodeURIComponent(threadId)}`)
  if (!res.ok) return []
  return res.json()
}

export async function sendMessage(payload: {
  thread_id: string
  sender: string
  body: string
  job_id?: string
  participants?: [string, string]
}): Promise<{ thread: Thread; msg: Msg } | null> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return null
  return res.json()
}

// Derive a stable thread ID from job + two participants (order-independent)
export function threadId(job_id: string, a: string, b: string): string {
  const sorted = [a, b].sort().join('_')
  return `thread_${job_id}_${sorted}`
}
