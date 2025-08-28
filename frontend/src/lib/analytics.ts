// Client-side analytics — persists to localStorage, syncs to API

export interface PageView {
  path: string
  ts: number
  wallet: string | null
}

export interface WalletVisit {
  address: string
  firstSeen: number
  lastSeen: number
  visits: number
}

export interface AnalyticsStore {
  pageViews: PageView[]
  walletVisits: Record<string, WalletVisit>
  totalSessions: number
}

const KEY = 'wc_analytics'

function load(): AnalyticsStore {
  if (typeof window === 'undefined') return { pageViews: [], walletVisits: {}, totalSessions: 0 }
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? { pageViews: [], walletVisits: {}, totalSessions: 0 }
  } catch {
    return { pageViews: [], walletVisits: {}, totalSessions: 0 }
  }
}

function save(store: AnalyticsStore) {
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch {}
}

export function trackPageView(path: string, wallet: string | null) {
  const store = load()
  store.pageViews.push({ path, ts: Date.now(), wallet })
  if (store.pageViews.length > 1000) store.pageViews = store.pageViews.slice(-1000)
  save(store)
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'pageview', path, wallet }),
  }).catch(() => {})
}

export function trackWalletConnect(address: string) {
  const store = load()
  const now = Date.now()
  const existing = store.walletVisits[address]
  store.walletVisits[address] = existing
    ? { ...existing, lastSeen: now, visits: existing.visits + 1 }
    : { address, firstSeen: now, lastSeen: now, visits: 1 }
  save(store)
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'wallet', address }),
  }).catch(() => {})
}

export function trackSession() {
  const store = load()
  store.totalSessions += 1
  save(store)
}

export function getAnalytics(): AnalyticsStore {
  return load()
}
