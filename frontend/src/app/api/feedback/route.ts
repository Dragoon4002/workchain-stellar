import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'feedback.json')

async function readData() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'))
  } catch {
    return { entries: [] }
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = await readData()
  data.entries.push({
    id: Date.now(),
    ts: new Date().toISOString(),
    type: body.type ?? 'feedback',     // 'feedback' | 'error'
    rating: body.rating ?? null,
    message: body.message ?? '',
    wallet: body.wallet ?? null,
    page: body.page ?? null,
    error: body.error ?? null,
  })
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(data, null, 2))
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json(await readData())
}
