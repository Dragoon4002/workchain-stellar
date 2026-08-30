import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const VIEWS_KEY = 'wc:analytics:pageViews'
const WALLETS_KEY = 'wc:analytics:wallets'
const TOTAL_KEY = 'wc:analytics:totalEvents'

export async function POST(req: NextRequest) {
  const body = await req.json()
  await redis.incr(TOTAL_KEY)

  if (body.type === 'pageview') {
    const entry = { path: body.path, wallet: body.wallet ?? null, ts: Date.now() }
    await redis.lpush(VIEWS_KEY, JSON.stringify(entry))
    await redis.ltrim(VIEWS_KEY, 0, 4999)
  } else if (body.type === 'wallet') {
    const addr = body.address as string
    const now = Date.now()
    const raw = await redis.hget<string>(WALLETS_KEY, addr)
    const existing = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null
    const updated = existing
      ? { ...existing, lastSeen: now, visits: existing.visits + 1 }
      : { address: addr, firstSeen: now, lastSeen: now, visits: 1 }
    await redis.hset(WALLETS_KEY, { [addr]: JSON.stringify(updated) })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const [rawViews, rawWallets, totalEvents] = await Promise.all([
    redis.lrange(VIEWS_KEY, 0, -1),
    redis.hgetall(WALLETS_KEY),
    redis.get<number>(TOTAL_KEY),
  ])

  const pageViews = (rawViews ?? []).map(v => typeof v === 'string' ? JSON.parse(v) : v)
  const wallets: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rawWallets ?? {})) {
    wallets[k] = typeof v === 'string' ? JSON.parse(v) : v
  }

  return NextResponse.json({ pageViews, wallets, totalEvents: totalEvents ?? 0 })
}
