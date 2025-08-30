import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { Store } from '../route'

// ponytail: re-read store inline, avoids cross-module mutable singleton issues in Next.js dev
const FILE = path.join(process.cwd(), 'data', 'messages.json')

async function read(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'))
  } catch {
    return { threads: [], messages: [] }
  }
}

// GET /api/messages/[id] — messages for a thread
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await read()
  const msgs = data.messages.filter((m) => m.thread_id === id)
  return NextResponse.json(msgs)
}
