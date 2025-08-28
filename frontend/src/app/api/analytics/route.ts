import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'analytics.json')

async function readData() {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return { pageViews: [], wallets: {}, totalEvents: 0 }
  }
}

async function writeData(data: object) {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(data, null, 2))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = await readData()
  data.totalEvents = (data.totalEvents ?? 0) + 1

  if (body.type === 'pageview') {
    data.pageViews.push({ path: body.path, wallet: body.wallet ?? null, ts: Date.now() })
    if (data.pageViews.length > 5000) data.pageViews = data.pageViews.slice(-5000)
  } else if (body.type === 'wallet') {
    const addr = body.address
    const existing = data.wallets[addr]
    const now = Date.now()
    data.wallets[addr] = existing
      ? { ...existing, lastSeen: now, visits: existing.visits + 1 }
      : { address: addr, firstSeen: now, lastSeen: now, visits: 1 }
  }

  await writeData(data)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}
