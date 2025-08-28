export interface Job {
  id: string
  title: string
  description: string
  budget: number
  startingPrice: number
  deadline: string
  clientAddress: string
  category: string
  tags: string[]
  milestones: Milestone[]
  status: 'open' | 'in_progress' | 'completed'
}

export interface Bid {
  id: string
  jobId: string
  freelancerAddress: string
  freelancerName: string
  price: number
  proposal: string
  reputation: number
  completedJobs: number
  skills: string[]
  submittedAt: string
}

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  encrypted: boolean
}

export interface MessageRoom {
  id: string
  contractId: string
  jobTitle: string
  clientAddress: string
  freelancerAddress: string
  messages: Message[]
  createdAt: string
}

export interface Milestone {
  id: string
  description: string
  amount: number
  status: 'pending' | 'active' | 'submitted' | 'approved' | 'disputed'
}

export interface Contract {
  id: string
  jobTitle: string
  clientAddress: string
  freelancerAddress: string
  totalAmount: number
  lockedAmount: number
  milestones: Milestone[]
  status: 'active' | 'completed' | 'disputed'
}

export interface Profile {
  walletAddress: string
  reputation: number
  totalJobs: number
  skills: string[]
  jobHistory: { id: string; title: string; amount: number; status: string }[]
}

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Build a DeFi Dashboard with React',
    description: 'We need a professional dashboard to track Stellar DeFi positions. Should include charts, token balances, yield tracking, and transaction history. Clean UI is a must.',
    budget: 2500,
    startingPrice: 2000,
    deadline: '2026-08-15',
    clientAddress: 'GBXYZ1234ABCDEF',
    category: 'Development',
    tags: ['React', 'TypeScript', 'DeFi', 'Stellar'],
    status: 'open',
    milestones: [
      { id: 'm1', description: 'UI wireframes and design system', amount: 500, status: 'pending' },
      { id: 'm2', description: 'Core dashboard components', amount: 1000, status: 'pending' },
      { id: 'm3', description: 'Integration with Horizon API', amount: 750, status: 'pending' },
      { id: 'm4', description: 'Testing and deployment', amount: 250, status: 'pending' },
    ],
  },
  {
    id: '2',
    title: 'Smart Contract Audit for Token Launch',
    description: 'Audit 3 Soroban contracts for our upcoming token launch. Looking for security vulnerabilities, gas optimization, and best practice compliance.',
    budget: 5000,
    startingPrice: 3500,
    deadline: '2026-08-01',
    clientAddress: 'GABC9876ZYXWVU',
    category: 'Security',
    tags: ['Soroban', 'Rust', 'Security', 'Audit'],
    status: 'open',
    milestones: [
      { id: 'm1', description: 'Initial code review', amount: 1000, status: 'pending' },
      { id: 'm2', description: 'Vulnerability assessment report', amount: 2500, status: 'pending' },
      { id: 'm3', description: 'Fix verification and final report', amount: 1500, status: 'pending' },
    ],
  },
  {
    id: '3',
    title: 'Design Brand Identity for Web3 Startup',
    description: 'Full brand identity package: logo, color palette, typography, icons, and brand guidelines document. We want something clean and modern, not your typical crypto aesthetic.',
    budget: 1800,
    startingPrice: 1200,
    deadline: '2026-07-30',
    clientAddress: 'GDEFF5678MNOPQ',
    category: 'Design',
    tags: ['Branding', 'Logo', 'Figma', 'Identity'],
    status: 'open',
    milestones: [
      { id: 'm1', description: 'Mood board and initial concepts', amount: 300, status: 'pending' },
      { id: 'm2', description: 'Logo design (3 concepts)', amount: 600, status: 'pending' },
      { id: 'm3', description: 'Full brand guidelines', amount: 900, status: 'pending' },
    ],
  },
  {
    id: '4',
    title: 'Rust Developer for Soroban Protocol',
    description: 'Build a lending protocol on Soroban. Need experience with Rust, DeFi mechanics, and preferably prior Soroban work. Full-time engagement for 2 months.',
    budget: 12000,
    startingPrice: 9000,
    deadline: '2026-09-30',
    clientAddress: 'GHIJK1357LMNOP',
    category: 'Development',
    tags: ['Rust', 'Soroban', 'DeFi', 'Lending'],
    status: 'open',
    milestones: [
      { id: 'm1', description: 'Architecture design and spec', amount: 1500, status: 'pending' },
      { id: 'm2', description: 'Core lending logic contracts', amount: 4500, status: 'pending' },
      { id: 'm3', description: 'Liquidation and oracle integration', amount: 3000, status: 'pending' },
      { id: 'm4', description: 'Testing and audit prep', amount: 3000, status: 'pending' },
    ],
  },
  {
    id: '5',
    title: 'Technical Writing for Stellar Documentation',
    description: 'Rewrite and expand the developer documentation for our SDK. Must be able to explain complex concepts simply. Stellar experience required.',
    budget: 800,
    startingPrice: 600,
    deadline: '2026-08-10',
    clientAddress: 'GQRST2468UVWXY',
    category: 'Writing',
    tags: ['Documentation', 'Technical Writing', 'Stellar', 'SDK'],
    status: 'open',
    milestones: [
      { id: 'm1', description: 'Content audit and outline', amount: 200, status: 'pending' },
      { id: 'm2', description: 'Core documentation rewrite', amount: 400, status: 'pending' },
      { id: 'm3', description: 'Examples and tutorials', amount: 200, status: 'pending' },
    ],
  },
  {
    id: '6',
    title: 'Mobile App for Stellar Payments',
    description: 'React Native app for sending and receiving XLM and stablecoins. Clean UX, biometric auth, QR code support. iOS and Android.',
    budget: 8000,
    startingPrice: 6000,
    deadline: '2026-10-15',
    clientAddress: 'GZABC1111DEFGH',
    category: 'Mobile',
    tags: ['React Native', 'Mobile', 'iOS', 'Android', 'Payments'],
    status: 'in_progress',
    milestones: [
      { id: 'm1', description: 'UI/UX design and prototyping', amount: 1500, status: 'approved' },
      { id: 'm2', description: 'Wallet creation and key management', amount: 2000, status: 'submitted' },
      { id: 'm3', description: 'Send/receive flows', amount: 2500, status: 'pending' },
      { id: 'm4', description: 'Polish and app store submission', amount: 2000, status: 'pending' },
    ],
  },
  {
    id: '7',
    title: 'Community Manager for DeFi Protocol',
    description: 'Manage Discord, Twitter, and Telegram communities. Create content, moderate discussions, organize AMAs. 20h/week.',
    budget: 1200,
    startingPrice: 900,
    deadline: '2026-08-31',
    clientAddress: 'GIJKL2222MNOPQ',
    category: 'Marketing',
    tags: ['Community', 'Discord', 'Twitter', 'Marketing'],
    status: 'open',
    milestones: [
      { id: 'm1', description: 'Month 1 community management', amount: 600, status: 'pending' },
      { id: 'm2', description: 'Month 2 community management', amount: 600, status: 'pending' },
    ],
  },
  {
    id: '8',
    title: 'Backend API for NFT Marketplace',
    description: 'REST API and database design for an NFT marketplace on Stellar. Node.js + PostgreSQL. Must handle high throughput and support websocket updates.',
    budget: 4500,
    startingPrice: 3500,
    deadline: '2026-09-15',
    clientAddress: 'GRSTU3333VWXYZ',
    category: 'Development',
    tags: ['Node.js', 'PostgreSQL', 'API', 'NFT', 'WebSocket'],
    status: 'open',
    milestones: [
      { id: 'm1', description: 'Database schema and API design', amount: 750, status: 'pending' },
      { id: 'm2', description: 'Core CRUD endpoints', amount: 1500, status: 'pending' },
      { id: 'm3', description: 'WebSocket and real-time features', amount: 1500, status: 'pending' },
      { id: 'm4', description: 'Performance testing and optimization', amount: 750, status: 'pending' },
    ],
  },
]

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'c1',
    jobTitle: 'Mobile App for Stellar Payments',
    clientAddress: 'GZABC1111DEFGH',
    freelancerAddress: 'GYOUR_ADDRESS_HERE',
    totalAmount: 8000,
    lockedAmount: 3500,
    status: 'active',
    milestones: [
      { id: 'm1', description: 'UI/UX design and prototyping', amount: 1500, status: 'approved' },
      { id: 'm2', description: 'Wallet creation and key management', amount: 2000, status: 'submitted' },
      { id: 'm3', description: 'Send/receive flows', amount: 2500, status: 'active' },
      { id: 'm4', description: 'Polish and app store submission', amount: 2000, status: 'pending' },
    ],
  },
  {
    id: 'c2',
    jobTitle: 'DeFi Dashboard with React',
    clientAddress: 'GBXYZ1234ABCDEF',
    freelancerAddress: 'GFREELANCER5678',
    totalAmount: 2500,
    lockedAmount: 2500,
    status: 'active',
    milestones: [
      { id: 'm1', description: 'UI wireframes and design system', amount: 500, status: 'approved' },
      { id: 'm2', description: 'Core dashboard components', amount: 1000, status: 'active' },
      { id: 'm3', description: 'Integration with Horizon API', amount: 750, status: 'pending' },
      { id: 'm4', description: 'Testing and deployment', amount: 250, status: 'pending' },
    ],
  },
]

export const MOCK_BIDS: Bid[] = [
  {
    id: 'b1', jobId: '1', freelancerAddress: 'GYOUR_ADDRESS_HERE',
    freelancerName: 'Alex K.', price: 2200, reputation: 4.9, completedJobs: 31,
    skills: ['React', 'TypeScript', 'DeFi'],
    proposal: 'Built 3 DeFi dashboards on Stellar. Can deliver in 3 weeks with all requested features plus mobile-responsive design.',
    submittedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'b2', jobId: '1', freelancerAddress: 'GFREELANCER5678',
    freelancerName: 'Priya M.', price: 1950, reputation: 4.6, completedJobs: 18,
    skills: ['React', 'Next.js', 'Charts'],
    proposal: 'Strong React background. I use Recharts + Horizon API daily. 2.5 week delivery.',
    submittedAt: '2026-07-20T14:30:00Z',
  },
  {
    id: 'b3', jobId: '1', freelancerAddress: 'GDEV9999ABCDEF',
    freelancerName: 'Marcus T.', price: 2500, reputation: 5.0, completedJobs: 52,
    skills: ['React', 'TypeScript', 'Soroban', 'DeFi'],
    proposal: 'Senior dev with 5y DeFi experience. Premium price for premium delivery — includes full test suite and docs.',
    submittedAt: '2026-07-21T09:15:00Z',
  },
  {
    id: 'b4', jobId: '2', freelancerAddress: 'GSEC1111AUDITOR',
    freelancerName: 'Wei L.', price: 4200, reputation: 4.8, completedJobs: 27,
    skills: ['Rust', 'Soroban', 'Security', 'Audit'],
    proposal: 'Audited 40+ Soroban contracts. Found critical vulns in 2 major protocols. Detailed report guaranteed.',
    submittedAt: '2026-07-19T11:00:00Z',
  },
  {
    id: 'b5', jobId: '2', freelancerAddress: 'GSEC2222RUSTDEV',
    freelancerName: 'Fatima A.', price: 3800, reputation: 4.7, completedJobs: 14,
    skills: ['Rust', 'Soroban', 'Formal Verification'],
    proposal: 'CS PhD + 2y Soroban audit experience. Can do formal verification on top of manual review.',
    submittedAt: '2026-07-19T16:45:00Z',
  },
  {
    id: 'b6', jobId: '4', freelancerAddress: 'GRUST3333DEFI',
    freelancerName: 'Dmitri V.', price: 10500, reputation: 4.9, completedJobs: 8,
    skills: ['Rust', 'Soroban', 'DeFi', 'Lending'],
    proposal: 'Built Aave-style lending protocol on EVM, now porting skills to Soroban. Can start Monday.',
    submittedAt: '2026-07-22T08:00:00Z',
  },
  {
    id: 'b7', jobId: '4', freelancerAddress: 'GRUST4444PROTO',
    freelancerName: 'Sara J.', price: 9500, reputation: 4.5, completedJobs: 12,
    skills: ['Rust', 'Soroban', 'Protocol Design'],
    proposal: 'Core contributor to Stellar ecosystem. Know the quirks deeply. Best value for the price.',
    submittedAt: '2026-07-22T12:30:00Z',
  },
]

export const MOCK_ROOMS: MessageRoom[] = [
  {
    id: 'room-c1',
    contractId: 'c1',
    jobTitle: 'Mobile App for Stellar Payments',
    clientAddress: 'GZABC1111DEFGH',
    freelancerAddress: 'GYOUR_ADDRESS_HERE',
    createdAt: '2026-07-10T09:00:00Z',
    messages: [
      { id: 'msg1', senderId: 'GZABC1111DEFGH', content: 'Hey! Excited to get started. Can we do a quick sync on the design direction?', timestamp: '2026-07-10T09:05:00Z', encrypted: false },
      { id: 'msg2', senderId: 'GYOUR_ADDRESS_HERE', content: 'Absolutely! I was thinking a clean, minimal UI — similar to Moonpay but with Stellar branding. Want me to share some references?', timestamp: '2026-07-10T09:12:00Z', encrypted: false },
      { id: 'msg3', senderId: 'GZABC1111DEFGH', content: 'Yes please. Also — biometric auth is a hard requirement for milestone 2. Make sure it works on Android 11+.', timestamp: '2026-07-10T09:18:00Z', encrypted: false },
      { id: 'msg4', senderId: 'GYOUR_ADDRESS_HERE', content: 'Noted. Will use react-native-biometrics — tested on Android 10-14. Milestone 1 wireframes are ready for review, check the shared Figma.', timestamp: '2026-07-10T10:30:00Z', encrypted: false },
      { id: 'msg5', senderId: 'GZABC1111DEFGH', content: 'Approved the Figma. Releasing milestone 1 funds now.', timestamp: '2026-07-11T14:00:00Z', encrypted: false },
    ],
  },
  {
    id: 'room-c2',
    contractId: 'c2',
    jobTitle: 'DeFi Dashboard with React',
    clientAddress: 'GBXYZ1234ABCDEF',
    freelancerAddress: 'GFREELANCER5678',
    createdAt: '2026-07-15T11:00:00Z',
    messages: [
      { id: 'msg1', senderId: 'GBXYZ1234ABCDEF', content: 'Welcome! The design system should match our current brand — I will send the Figma link.', timestamp: '2026-07-15T11:05:00Z', encrypted: false },
      { id: 'msg2', senderId: 'GFREELANCER5678', content: 'Got it. Will use shadcn/ui as the base so swapping tokens is easy. Starting on milestone 2 core components now.', timestamp: '2026-07-15T11:20:00Z', encrypted: false },
    ],
  },
]

export interface FreelancerListing {
  walletAddress: string
  name: string
  tagline: string
  hourlyRate: number
  skills: string[]
  category: string
  reputation: number
  completedJobs: number
  responseTime: string
  availability: 'available' | 'busy' | 'unavailable'
  portfolio: { title: string; description: string; tag: string }[]
  totalEarned: number
}

export const MOCK_FREELANCERS: FreelancerListing[] = [
  {
    walletAddress: 'GYOUR_ADDRESS_HERE',
    name: 'Alex K.',
    tagline: 'Full-stack Stellar & Soroban developer. DeFi dashboards, protocol design.',
    hourlyRate: 120,
    skills: ['React', 'TypeScript', 'Soroban', 'Rust', 'Node.js'],
    category: 'Development',
    reputation: 4.9,
    completedJobs: 31,
    responseTime: '< 1 hour',
    availability: 'available',
    totalEarned: 48200,
    portfolio: [
      { title: 'DeFi Dashboard MVP', description: 'Real-time Stellar position tracker with yield charts.', tag: 'React' },
      { title: 'Token Vesting Contract', description: 'Soroban vesting contract with cliff + linear release.', tag: 'Soroban' },
      { title: 'NFT Minting Platform', description: 'Full-stack NFT marketplace on Stellar.', tag: 'Full-stack' },
    ],
  },
  {
    walletAddress: 'GFREELANCER5678',
    name: 'Priya M.',
    tagline: 'React & Next.js specialist. Clean UIs, fast delivery.',
    hourlyRate: 85,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Figma'],
    category: 'Development',
    reputation: 4.6,
    completedJobs: 18,
    responseTime: '< 2 hours',
    availability: 'available',
    totalEarned: 22400,
    portfolio: [
      { title: 'Analytics Dashboard', description: 'Multi-chain analytics with recharts + Horizon API.', tag: 'React' },
      { title: 'Landing Page System', description: 'Component library for Web3 marketing sites.', tag: 'Next.js' },
    ],
  },
  {
    walletAddress: 'GDEV9999ABCDEF',
    name: 'Marcus T.',
    tagline: 'Senior full-stack, 5y DeFi. Architecture + delivery, no hand-holding.',
    hourlyRate: 200,
    skills: ['React', 'TypeScript', 'Soroban', 'Rust', 'PostgreSQL', 'Docker'],
    category: 'Development',
    reputation: 5.0,
    completedJobs: 52,
    responseTime: '< 4 hours',
    availability: 'busy',
    totalEarned: 134000,
    portfolio: [
      { title: 'Lending Protocol', description: 'Aave-style lending on Soroban with liquidation engine.', tag: 'Soroban' },
      { title: 'DEX Aggregator', description: 'Cross-AMM routing for best price on Stellar.', tag: 'DeFi' },
      { title: 'DAO Governance Suite', description: 'On-chain voting + treasury management.', tag: 'Full-stack' },
    ],
  },
  {
    walletAddress: 'GSEC1111AUDITOR',
    name: 'Wei L.',
    tagline: 'Smart contract auditor. 40+ Soroban audits. Found criticals in 2 major protocols.',
    hourlyRate: 250,
    skills: ['Rust', 'Soroban', 'Security', 'Audit', 'Formal Verification'],
    category: 'Security',
    reputation: 4.8,
    completedJobs: 27,
    responseTime: '< 1 hour',
    availability: 'available',
    totalEarned: 89000,
    portfolio: [
      { title: 'Escrow Contract Audit', description: 'Found 2 critical reentrancy vectors, full report + fixes.', tag: 'Audit' },
      { title: 'Token Launch Security Review', description: 'Pre-launch audit for $12M raise.', tag: 'Security' },
    ],
  },
  {
    walletAddress: 'GSEC2222RUSTDEV',
    name: 'Fatima A.',
    tagline: 'CS PhD + Soroban specialist. Formal verification for mission-critical contracts.',
    hourlyRate: 180,
    skills: ['Rust', 'Soroban', 'Formal Verification', 'Security'],
    category: 'Security',
    reputation: 4.7,
    completedJobs: 14,
    responseTime: '< 3 hours',
    availability: 'available',
    totalEarned: 41000,
    portfolio: [
      { title: 'Stablecoin Peg Mechanism', description: 'Formal proof of peg stability invariants.', tag: 'Verification' },
    ],
  },
  {
    walletAddress: 'GRUST3333DEFI',
    name: 'Dmitri V.',
    tagline: 'Protocol engineer. EVM → Soroban. Lending, AMMs, liquidations.',
    hourlyRate: 160,
    skills: ['Rust', 'Soroban', 'DeFi', 'Lending', 'AMM'],
    category: 'Development',
    reputation: 4.9,
    completedJobs: 8,
    responseTime: '< 2 hours',
    availability: 'available',
    totalEarned: 28500,
    portfolio: [
      { title: 'Lending Protocol (EVM)', description: 'Aave fork with custom risk parameters, $40M TVL.', tag: 'DeFi' },
      { title: 'AMM on Soroban', description: 'Constant-product AMM with concentrated liquidity.', tag: 'Soroban' },
    ],
  },
  {
    walletAddress: 'GDESIGN111BRAND',
    name: 'Lena S.',
    tagline: 'Brand identity & UI design. Web3 aesthetic without the crypto clichés.',
    hourlyRate: 95,
    skills: ['Figma', 'Branding', 'Logo', 'UI Design', 'Motion'],
    category: 'Design',
    reputation: 4.8,
    completedJobs: 23,
    responseTime: '< 1 hour',
    availability: 'available',
    totalEarned: 31200,
    portfolio: [
      { title: 'DeFi Protocol Rebrand', description: 'Full brand identity: logo, palette, type, iconography.', tag: 'Branding' },
      { title: 'Wallet App UI', description: 'Figma system for a non-custodial mobile wallet.', tag: 'UI' },
    ],
  },
  {
    walletAddress: 'GWRITE222DOCS',
    name: 'Jordan T.',
    tagline: 'Technical writer for blockchain SDKs and protocols. Explains hard things simply.',
    hourlyRate: 60,
    skills: ['Technical Writing', 'Documentation', 'Stellar', 'SDK', 'Tutorials'],
    category: 'Writing',
    reputation: 4.5,
    completedJobs: 19,
    responseTime: '< 6 hours',
    availability: 'available',
    totalEarned: 14800,
    portfolio: [
      { title: 'Stellar SDK Docs Rewrite', description: 'Rewrote 80-page SDK reference from scratch.', tag: 'Docs' },
      { title: 'DeFi Protocol Whitepaper', description: 'Technical whitepaper for a lending protocol launch.', tag: 'Writing' },
    ],
  },
]

export const MOCK_PROFILES: Record<string, Profile> = {
  GYOUR_ADDRESS_HERE: {
    walletAddress: 'GYOUR_ADDRESS_HERE',
    reputation: 4.7,
    totalJobs: 23,
    skills: ['React', 'TypeScript', 'Soroban', 'Rust', 'Node.js'],
    jobHistory: [
      { id: '1', title: 'DeFi Dashboard MVP', amount: 3200, status: 'completed' },
      { id: '2', title: 'Token Vesting Contract', amount: 1800, status: 'completed' },
      { id: '3', title: 'NFT Minting Platform', amount: 5500, status: 'completed' },
    ],
  },
}
