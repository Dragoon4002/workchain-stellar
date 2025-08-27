export interface Job {
  id: string
  title: string
  description: string
  budget: number
  deadline: string
  clientAddress: string
  category: string
  tags: string[]
  milestones: Milestone[]
  status: 'open' | 'in_progress' | 'completed'
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
