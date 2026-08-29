# WorkChain

**Programmable Project Settlement Protocol on Stellar.**

Multi-party project treasuries with milestone-gated escrow, bps-based payment splits, and 72-hour auto-release timeout — all on Soroban smart contracts. No fees. No banks. No middlemen.

Live: **[workchain.vercel.app](https://workchain.vercel.app)** · Network: Stellar Testnet · Contracts: Stellar Testnet

---

## The Problem

Traditional freelance platforms (Upwork, Fiverr) take 5–20% in fees, hold payments for 5–14 days, can freeze accounts arbitrarily, and require full KYC. Multi-contributor projects are even harder — splitting payments between teammates is manual, trust-based, and error-prone.

## The Solution

WorkChain replaces the platform with code. Five Soroban smart contracts on Stellar handle the full project lifecycle:

- Client creates a **Project Vault** with participants and basis-point payment splits
- Funds deposited into the vault; vault activates when fully funded
- Owner adds milestones with per-milestone amounts
- Participants submit work with proof URLs
- Owner approves → funds split and distributed instantly per `bps` config
- No approval after 72 hours? Any participant claims timeout → auto-settlement
- Dispute raises an on-chain flag for resolution

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
            ├── Project Vault Contract  ← new pivot contract
            ├── Escrow Contract
            ├── Job Contract
            ├── Milestone Contract
            └── Reputation Contract
```

### Smart Contracts

All contracts deployed to **Stellar Testnet**, written in Rust, Soroban SDK v21.

#### Project Vault Contract (`contracts/project_vault`) — core product

Multi-party treasury with milestone-gated settlement and 72h auto-release.

| Function | Description |
|---|---|
| `create(owner, token, total, participants)` | Creates vault; participants is list of `{wallet, bps}` where sum(bps)==10000 |
| `fund(funder, vault_id, amount)` | Deposit into vault; vault activates when deposited >= total |
| `add_milestone(owner, vault_id, description, amount)` | Add milestone (owner only, vault state ≤ 1) |
| `submit_milestone(caller, vault_id, idx, proof_url)` | Participant submits proof; records `submitted_at` timestamp |
| `approve_milestone(owner, vault_id, idx)` | Owner approves; triggers bps split distribution |
| `claim_timeout(caller, vault_id, idx)` | Any participant claims if 72h elapsed since submit; auto-settles |
| `dispute_milestone(caller, vault_id, idx)` | Owner or participant raises dispute flag |
| `get_vault(vault_id)` | Read vault data |
| `get_milestone(vault_id, idx)` | Read milestone data |
| `get_participant(vault_id, idx)` | Read participant data |

**Vault states:** `0` funding · `1` active · `2` settled · `3` cancelled

**Milestone states:** `0` pending · `1` submitted · `2` approved · `3` disputed · `4` claimable (timeout)

#### Escrow Contract (`contracts/escrow`)

Handles fund locking, release, cancellation for the job marketplace flow.

| Function | Description |
|---|---|
| `deposit(client, freelancer, amount, token, milestone_id)` | Client locks XLM into escrow |
| `release(client, milestone_id)` | Release funds to freelancer |
| `cancel(client, milestone_id)` | Cancel and refund client |
| `dispute(caller, milestone_id)` | Raise dispute flag |

#### Job Contract (`contracts/job`)

| Function | Description |
|---|---|
| `post_job(client, title, description, budget, deadline)` | Creates job, returns `job_id` |
| `apply(freelancer, job_id, proposal)` | Freelancer submits proposal |
| `hire(client, job_id, freelancer)` | Client selects freelancer |
| `get(job_id)` | Read job data |

#### Milestone Contract (`contracts/milestone`)

| Function | Description |
|---|---|
| `create(job_id, description, amount, deadline)` | Adds milestone |
| `submit(freelancer, milestone_id, proof_url)` | Submit proof |
| `approve(client, milestone_id)` | Approve milestone |
| `dispute(caller, milestone_id)` | Raise dispute |
| `request_revision(client, milestone_id, feedback)` | Request revision |

#### Reputation Contract (`contracts/reputation`)

| Function | Description |
|---|---|
| `record(wallet, score, job_id)` | Records 1–5 rating after completion |
| `get_score(wallet)` | Average reputation score |
| `get_count(wallet)` | Total review count |

### Contract Addresses (Testnet)

| Contract | Address |
|---|---|
| Escrow | `CBXBUXK2UI55M3STP2L2ZHBP6NEWKSDRKK3RAERQTH2XMQBYMIZAVPOJ` |
| Job | set in Vercel env vars |
| Milestone | set in Vercel env vars |
| Reputation | set in Vercel env vars |
| Project Vault | `CCK7S2FKE257IY4LIUACPAL5JFKUHYO6GWVZ7B6WGM6VVOSK6JZIKZ5N` |

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
git clone https://github.com/Dragoon4002/workchain-stellar
cd workchain-stellar/frontend
npm install
cp .env.example .env.local
# fill in contract addresses
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ESCROW=CBXBUXK2UI55M3STP2L2ZHBP6NEWKSDRKK3RAERQTH2XMQBYMIZAVPOJ
NEXT_PUBLIC_CONTRACT_JOB=<deployed_contract_address>
NEXT_PUBLIC_CONTRACT_MILESTONE=<deployed_contract_address>
NEXT_PUBLIC_CONTRACT_REPUTATION=<deployed_contract_address>
NEXT_PUBLIC_CONTRACT_PROJECT_VAULT=CCK7S2FKE257IY4LIUACPAL5JFKUHYO6GWVZ7B6WGM6VVOSK6JZIKZ5N
NEXT_PUBLIC_XLM_TOKEN=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

### Building Contracts

```bash
# From contract directory (requires wasm32v1-none target)
cd contracts/project_vault
stellar contract build

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/workchain_project_vault.wasm \
  --network testnet \
  --source workchain-deployer
```

---

## Features

- **Project Vaults** — multi-party treasuries with bps payment splits
- **72h Auto-Settlement** — participants claim timeout if owner is unresponsive
- **Milestone Escrow** — funds release per milestone on approval
- **Job Marketplace** — post jobs, bid, hire freelancers
- **Wallet-based identity** — Freighter or any Stellar wallet, no signup
- **On-chain reputation** — immutable score tied to wallet address
- **Dispute flags** — on-chain dispute state for resolution

---

## User Onboarding

We onboarded **50 testnet users** across 25 client/freelancer pairs. Each pair completed a full deposit + release cycle on the escrow contract, generating **50 real on-chain transactions** on Stellar Testnet.

**User feedback form:** [Google Form — link TBD]

**User list with wallet addresses:** [tasks/workchain-users.csv](tasks/workchain-users.csv)

The CSV includes: name, email, wallet address, role (client/freelancer), transaction count.

### How to get testnet XLM

1. Install [Freighter wallet](https://freighter.app)
2. Switch network to **Testnet**
3. Fund via [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
4. Connect wallet on WorkChain

---

## Next Phase Improvements (Based on User Feedback)

### UX Improvements
- Simplify wallet connection for non-crypto users ([commit: sidebar + landing rebrand](https://github.com/Dragoon4002/workchain-stellar/commit/64c938d))
- Guided onboarding tour for first-time visitors
- Mobile-responsive layout improvements

### Feature Additions
- Multi-token support (USDC on Stellar)
- Real-time messaging via Stellar memos or off-chain relay
- Email/push notifications for milestone events
- Freelancer portfolio with IPFS-hosted work samples

### Technical
- Indexer (Mercury / Subquery) for historical vault/job queries — currently using localStorage index pattern
- Full pagination for job/contract lists
- Expand project vault dispute resolution to 2-of-3 multisig

*Improvement commits will be linked here as feedback is collected.*

---

## License

MIT
