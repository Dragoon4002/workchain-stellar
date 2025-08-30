import { NextRequest, NextResponse } from 'next/server'

// ponytail: localStorage is client-only; server route proxies via Next.js response but actual
// persistence lives in the browser. For a real app swap for a DB call here.

export async function GET(req: NextRequest) {
  const freelancer = req.nextUrl.searchParams.get('freelancer')
  if (!freelancer) return NextResponse.json({ error: 'freelancer param required' }, { status: 400 })
  // Data lives in localStorage — return empty here; client fetches directly via lib/reviews.ts
  return NextResponse.json({ reviews: [] })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reviewer, freelancer, job_id, stars, text, job_title } = body
    if (!reviewer || !freelancer || !job_id || !stars || !text) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }
    if (stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'stars must be 1-5' }, { status: 400 })
    }
    // Actual storage happens client-side; server just validates and acks
    return NextResponse.json({ ok: true, job_title })
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
}
