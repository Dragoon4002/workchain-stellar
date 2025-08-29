# WorkChain

**Decentralized freelance marketplace built on Stellar.**

Clients post jobs. Freelancers bid. Funds lock in Soroban smart contract escrow. Every milestone releases automatically on approval — no platform fees, no banks, no middlemen.

Live: **[workchain.vercel.app](https://workchain.vercel.app)** · Network: Stellar Testnet

---

## The Problem

Traditional freelance platforms (Upwork, Fiverr) take 5–20% in fees, hold payments for 5–14 days, can freeze accounts arbitrarily, and require full KYC. There is no trustless mechanism — you rely on the platform to be honest.

## The Solution

WorkChain replaces the platform with code. Four Soroban smart contracts on Stellar handle the full lifecycle:

- Client deposits XLM into escrow
- Freelancer countersigns to activate
- Work is submitted with a proof URL per milestone
- Client approves → funds release instantly to freelancer's wallet
- Dispute? 2-of-3 multisig arbitration resolves it on-chain

Your Stellar wallet is your identity. No account, no email, no KYC.

---

## Architecture

```
Frontend (Next.js 16)
    │
    ├── Stellar Wallets Kit (Freighter, WalletConnect, etc.)
    ├── @stellar/stellar-sdk (transaction building, RPC calls)
    │
    └── Soroban Smart Contracts (Rust)
            ├── Escrow Contract
            ├── Job Contract
            ├── Milestone Contract
            └── Reputation Contract
```

### Smart Contracts

All contracts are deployed to **Stellar Testnet** and written in Rust using the Soroban SDK v21.

#### Escrow Contract (`contracts/escrow`)

Handles fund locking, release, cancellation, and dispute resolution.

| Function | Description |
|---|---|
| `deposit(client, freelancer, server, amount, token, escrow_id)` | Client locks XLM into escrow, state = `pending_countersign` |
| `countersign(freelancer, escrow_id)` | Freelancer activates the escrow, state = `active` |
| `propose_release(caller, escrow_id)` | Either party proposes mutual release |
| `release(caller, escrow_id)` | Both parties signed release → funds sent to freelancer |
| `cancel(caller, escrow_id)` | Both parties signed cancel → funds returned to client |
| `resolve_dispute(server, escrow_id, release)` | Server key (arbitrator) resolves dispute via 2-of-3 multisig |

**Escrow states:** `0` pending_countersign · `1` active · `2` released · `3` cancelled · `4` disputed

#### Job Contract (`contracts/job`)

Posts and tracks jobs on-chain.

| Function | Description |
|---|---|
| `post_job(client, title, description, budget, deadline)` | Creates a job, returns `job_id` |
| `apply(freelancer, job_id, proposal)` | Freelancer submits a proposal |
| `hire(client, job_id, freelancer)` | Client selects a freelancer, state = `active` |
| `get(job_id)` | Read a job's full data |

**Job states:** `0` open · `1` active · `2` closed

#### Milestone Contract (`contracts/milestone`)

Tracks per-milestone work submission and approval.

| Function | Description |
|---|---|
| `create(job_id, description, amount, deadline)` | Adds a milestone to a job |
| `submit(freelancer, milestone_id, proof_url)` | Freelancer submits proof of work |
| `approve(client, milestone_id)` | Client approves, triggers escrow release |
| `dispute(caller, milestone_id)` | Either party raises a dispute |

#### Reputation Contract (`contracts/reputation`)

On-chain reputation scores — immutable, not platform-controlled.

| Function | Description |
|---|---|
| `record(wallet, score, job_id)` | Records a rating (1–5) after job completion |
| `get_score(wallet)` | Returns average reputation score |
| `get_count(wallet)` | Returns total number of reviews |

### Contract Addresses (Testnet)

| Contract | Address |
|---|---|
| Escrow | `NEXT_PUBLIC_CONTRACT_ESCROW` (set in Vercel env vars) |
| Job | `NEXT_PUBLIC_CONTRACT_JOB` |
| Milestone | `NEXT_PUBLIC_CONTRACT_MILESTONE` |
| Reputation | `NEXT_PUBLIC_CONTRACT_REPUTATION` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Animations | Motion (Framer Motion) |
| Wallet | Stellar Wallets Kit (Freighter, WalletConnect) |
| Blockchain | Stellar Testnet, Soroban smart contracts |
| Language (contracts) | Rust, Soroban SDK v21 |
| Deployment | Vercel |

---

## Running Locally

```bash
# Clone
git clone https://github.com/Dragoon4002/workchain
cd workchain/frontend

# Install
npm install

# Set env vars — create .env.local
cp .env.example .env.local
# Fill in contract addresses and RPC URLs

# Dev server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ESCROW=<deployed_contract_address>
NEXT_PUBLIC_CONTRACT_JOB=<deployed_contract_address>
NEXT_PUBLIC_CONTRACT_MILESTONE=<deployed_contract_address>
NEXT_PUBLIC_CONTRACT_REPUTATION=<deployed_contract_address>
NEXT_PUBLIC_XLM_TOKEN=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

### Building Contracts

```bash
# From repo root
cargo build --target wasm32-unknown-unknown --release

# Deploy (requires Stellar CLI)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --network testnet \
  --source <your_secret_key>
```

---

## Features

- **Wallet-based identity** — connect Freighter or any Stellar wallet, no signup
- **Job marketplace** — post jobs with milestones, budgets, deadlines
- **Trustless escrow** — XLM locked on-chain, released per milestone
- **Bid system** — freelancers submit proposals with custom prices
- **On-chain reputation** — immutable score tied to wallet address
- **2-of-3 dispute resolution** — multisig arbitration, no platform override
- **Analytics dashboard** — track wallet interactions, page views, user feedback
- **Error reporting** — runtime errors surfaced to users with 1-click dev notification

---

## User Onboarding

We are onboarding users to WorkChain on Stellar Testnet.

**User feedback form:** [PLACEHOLDER — LINK TO BE ADDED]

**Onboarding responses (wallet addresses, feedback, ratings):**
[PLACEHOLDER — GOOGLE SHEETS LINK TO BE ADDED]

### How to get testnet XLM

1. Install [Freighter wallet](https://freighter.app)
2. Switch network to **Testnet**
3. Visit [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test) and fund your address
4. Connect wallet on WorkChain and start exploring

---

## Next Phase Improvements (Based on User Feedback)

This section will be updated with real user feedback after the onboarding period. Planned improvement areas:

### UX Improvements
- Simplify the wallet connection flow for non-crypto users
- Add a guided onboarding tour for first-time visitors
- Mobile-responsive layout improvements

### Feature Additions
- Real-time messaging via Stellar memos or off-chain relay
- Email/push notifications for milestone events
- Multi-token support (USDC on Stellar)
- Freelancer portfolio with IPFS-hosted work samples

### Technical
- Replace mock data entirely with live Soroban queries
- Implement full pagination for job/contract lists
- Add indexer (Mercury / Subquery) for historical transaction data

*Commit links to implemented improvements will be added here as feedback is collected and acted on.*

---

## Commits

| # | Commit | Description |
|---|---|---|
| 1 | `6a0df5a` | Implement all 4 Soroban contracts |
| 2 | `51db31b` | Scaffold Next.js frontend with wallet integration |
| 3 | `f40442b` | Build + deploy contracts to testnet |
| 4 | `91a914a` | Wire real Soroban contract calls into UI |
| 5 | `0716cc2` | Client + Freelancer escrow resolver, UI improvements |
| 6 | `bc6e633` | Add client-side analytics lib |
| 7 | `2b5e9b4` | Add /api/analytics server route |
| 8 | `dcd8e5e` | Add /api/feedback server route |
| 9 | `0bde24d` | Add AnalyticsTracker component |
| 10 | `3f41389` | Add FeedbackWidget with star rating |
| 11 | `6f81b00` | Add ErrorBoundary with edge toast |
| 12 | `4054406` | Add /app/admin analytics dashboard |
| 13 | `346b38b` | Wire analytics + feedback into app layout |
| 14 | `c5c27b5` | Fix Vercel deployment config |

---

## License

MIT
