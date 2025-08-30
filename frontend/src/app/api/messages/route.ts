import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

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

export interface Store {
  threads: Thread[]
  messages: Msg[]
}

const FILE = path.join(process.cwd(), 'data', 'messages.json')

const ME = 'GYOUR_ADDRESS_HERE'

// ponytail: seed once so UI is never empty; skipped if file already exists
const SEED: Store = {
  threads: [
    {
      id: 'thread_6_GZABC1111DEFGH_GYOUR_ADDRESS_HERE',
      job_id: '6',
      participants: [ME, 'GZABC1111DEFGH'],
      last_message: 'Approved the Figma. Releasing milestone 1 funds now.',
      updated_at: new Date('2026-07-11T14:00:00Z').getTime(),
    },
    {
      id: 'thread_1_GBXYZ1234ABCDEF_GYOUR_ADDRESS_HERE',
      job_id: '1',
      participants: [ME, 'GBXYZ1234ABCDEF'],
      last_message: 'Let me know when you want to sync on the dashboard layout.',
      updated_at: new Date('2026-07-20T11:00:00Z').getTime(),
    },
    {
      id: 'thread_4_GHIJK1357LMNOP_GYOUR_ADDRESS_HERE',
      job_id: '4',
      participants: [ME, 'GHIJK1357LMNOP'],
      last_message: 'I can start Monday. Are there any existing specs I should read first?',
      updated_at: new Date('2026-07-22T09:00:00Z').getTime(),
    },
  ],
  messages: [
    { id: 'sm1', thread_id: 'thread_6_GZABC1111DEFGH_GYOUR_ADDRESS_HERE', sender: 'GZABC1111DEFGH', body: 'Hey! Excited to get started. Can we do a quick sync on the design direction?', timestamp: new Date('2026-07-10T09:05:00Z').getTime() },
    { id: 'sm2', thread_id: 'thread_6_GZABC1111DEFGH_GYOUR_ADDRESS_HERE', sender: ME, body: 'Absolutely! I was thinking a clean, minimal UI. Want me to share some references?', timestamp: new Date('2026-07-10T09:12:00Z').getTime() },
    { id: 'sm3', thread_id: 'thread_6_GZABC1111DEFGH_GYOUR_ADDRESS_HERE', sender: 'GZABC1111DEFGH', body: 'Yes please. Also — biometric auth is a hard requirement for milestone 2.', timestamp: new Date('2026-07-10T09:18:00Z').getTime() },
    { id: 'sm4', thread_id: 'thread_6_GZABC1111DEFGH_GYOUR_ADDRESS_HERE', sender: ME, body: 'Noted. Milestone 1 wireframes are ready for review, check the shared Figma.', timestamp: new Date('2026-07-10T10:30:00Z').getTime() },
    { id: 'sm5', thread_id: 'thread_6_GZABC1111DEFGH_GYOUR_ADDRESS_HERE', sender: 'GZABC1111DEFGH', body: 'Approved the Figma. Releasing milestone 1 funds now.', timestamp: new Date('2026-07-11T14:00:00Z').getTime() },
    { id: 'sm6', thread_id: 'thread_1_GBXYZ1234ABCDEF_GYOUR_ADDRESS_HERE', sender: 'GBXYZ1234ABCDEF', body: 'Hi, saw your bid. Your portfolio looks strong. Can you share more about your Horizon API experience?', timestamp: new Date('2026-07-20T10:00:00Z').getTime() },
    { id: 'sm7', thread_id: 'thread_1_GBXYZ1234ABCDEF_GYOUR_ADDRESS_HERE', sender: ME, body: 'Sure — I integrated Horizon for real-time balance tracking in 2 prior projects. Happy to share examples.', timestamp: new Date('2026-07-20T10:30:00Z').getTime() },
    { id: 'sm8', thread_id: 'thread_1_GBXYZ1234ABCDEF_GYOUR_ADDRESS_HERE', sender: ME, body: 'Let me know when you want to sync on the dashboard layout.', timestamp: new Date('2026-07-20T11:00:00Z').getTime() },
    { id: 'sm9', thread_id: 'thread_4_GHIJK1357LMNOP_GYOUR_ADDRESS_HERE', sender: ME, body: 'I can start Monday. Are there any existing specs I should read first?', timestamp: new Date('2026-07-22T09:00:00Z').getTime() },
  ],
}

async function read(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'))
  } catch {
    // seed on first access
    await write(SEED)
    return SEED
  }
}

async function write(data: Store) {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(data, null, 2))
}

// GET /api/messages?wallet=ADDRESS
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  const data = await read()
  const threads = wallet
    ? data.threads.filter((t) => t.participants.includes(wallet))
    : data.threads
  return NextResponse.json(threads)
}

// POST /api/messages — { thread_id, sender, body, job_id, participants }
// If thread_id is new and job_id + participants provided, creates thread too
export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = await read()

  // Upsert thread
  let thread = data.threads.find((t) => t.id === body.thread_id)
  if (!thread) {
    thread = {
      id: body.thread_id,
      job_id: body.job_id,
      participants: body.participants,
      last_message: body.body,
      updated_at: Date.now(),
    }
    data.threads.push(thread)
  } else {
    thread.last_message = body.body
    thread.updated_at = Date.now()
  }

  const msg: Msg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    thread_id: body.thread_id,
    sender: body.sender,
    body: body.body,
    timestamp: Date.now(),
  }
  data.messages.push(msg)

  await write(data)
  return NextResponse.json({ thread, msg }, { status: 201 })
}
