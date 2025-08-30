export interface Review {
  id: string
  reviewer: string
  freelancer: string
  job_id: string
  stars: number
  text: string
  job_title: string
  created_at: number
}

const KEY = 'workchain_reviews'

function load(): Review[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(reviews: Review[]) {
  localStorage.setItem(KEY, JSON.stringify(reviews))
}

const SEED: Review[] = [
  {
    id: 'seed-1',
    reviewer: 'GZABC1111DEFGH',
    freelancer: 'GYOUR_ADDRESS_HERE',
    job_id: 'c1',
    stars: 5,
    text: 'Exceptional work on the mobile app. Delivered ahead of schedule with clean code and zero bugs. Would hire again without hesitation.',
    job_title: 'Mobile App for Stellar Payments',
    created_at: 1751500000000,
  },
  {
    id: 'seed-2',
    reviewer: 'GBXYZ1234ABCDEF',
    freelancer: 'GYOUR_ADDRESS_HERE',
    job_id: 'old-1',
    stars: 5,
    text: 'Built our DeFi dashboard with impressive attention to detail. The charts are smooth and the Horizon API integration is rock solid.',
    job_title: 'DeFi Dashboard MVP',
    created_at: 1748900000000,
  },
  {
    id: 'seed-3',
    reviewer: 'GHIJK1357LMNOP',
    freelancer: 'GYOUR_ADDRESS_HERE',
    job_id: 'old-2',
    stars: 4,
    text: 'Solid Soroban developer with good communication. Took a bit longer than expected on the testing phase but the final contract quality was high.',
    job_title: 'Token Vesting Contract',
    created_at: 1746300000000,
  },
]

export function getReviews(freelancer: string): Review[] {
  const all = load()
  // seed on first call for demo address
  if (freelancer === 'GYOUR_ADDRESS_HERE' && all.filter(r => r.freelancer === 'GYOUR_ADDRESS_HERE').length === 0) {
    const merged = [...all, ...SEED]
    save(merged)
    return SEED
  }
  return all.filter(r => r.freelancer === freelancer)
}

export function addReview(review: Omit<Review, 'id' | 'created_at'>): Review {
  const all = load()
  const next: Review = { ...review, id: `r-${Date.now()}`, created_at: Date.now() }
  save([...all, next])
  return next
}
