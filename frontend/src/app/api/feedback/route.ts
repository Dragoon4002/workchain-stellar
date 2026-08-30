import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const KEY = 'wc:feedback:entries'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = {
    id: Date.now(),
    ts: new Date().toISOString(),
    type: body.type ?? 'feedback',
    rating: body.rating ?? null,
    message: body.message ?? '',
    wallet: body.wallet ?? null,
    page: body.page ?? null,
    error: body.error ?? null,
  }
  await redis.lpush(KEY, JSON.stringify(entry))
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const raw = await redis.lrange(KEY, 0, -1)
  const entries = (raw ?? []).map(v => typeof v === 'string' ? JSON.parse(v) : v)
  return NextResponse.json({ entries })
}
