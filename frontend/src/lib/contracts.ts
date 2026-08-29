'use client'

import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  nativeToScVal,
  scValToNative,
  Address,
  rpc,
} from '@stellar/stellar-sdk'
import { rpcServer, server, CONTRACT_ADDRESSES, XLM_TOKEN, NETWORK_PASSPHRASE } from './stellar'
import { StellarWalletsKit } from './wallet'

// ponytail: known funded testnet account for sim-only fallback
const SIM_ACCOUNT = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN'
const STELLAR_ADDR = /^G[A-Z2-7]{55}$/

export function xlmToStroops(xlm: number): bigint {
  if (!Number.isFinite(xlm)) throw new Error('Invalid amount')
  if (xlm < 0) throw new Error('Amount cannot be negative')
  return BigInt(Math.round(xlm * 10_000_000))
}
export function stroopsToXlm(stroops: bigint | number): number {
  return Number(stroops) / 10_000_000
}

async function invoke(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[]
): Promise<rpc.Api.GetTransactionResponse> {
  if (!contractId) throw new Error('Contract address not configured. Check environment variables.')
  const contract = new Contract(contractId)
  const account = await server.loadAccount(sourceAddress)

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const simResult = await rpcServer.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(simResult)) throw new Error(`Simulate failed: ${simResult.error}`)

  const assembled = rpc.assembleTransaction(tx, simResult).build()

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(assembled.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: sourceAddress,
  })

  const submitted = await rpcServer.sendTransaction(
    TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)
  )
  if (submitted.status === 'ERROR') throw new Error(`Send failed: ${JSON.stringify(submitted.errorResult)}`)

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const confirmed = await rpcServer.getTransaction(submitted.hash)
    if (confirmed.status === rpc.Api.GetTransactionStatus.SUCCESS) return confirmed
    if (confirmed.status === rpc.Api.GetTransactionStatus.FAILED) throw new Error('Transaction failed on-chain')
  }
  throw new Error('Transaction timeout — not confirmed after 40 seconds')
}

async function read(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[]
): Promise<unknown> {
  if (!contractId) throw new Error('Contract address not configured. Check environment variables.')
  const contract = new Contract(contractId)

  let account
  try {
    account = await server.loadAccount(sourceAddress)
  } catch {
    account = await server.loadAccount(SIM_ACCOUNT)
  }

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const simResult = await rpcServer.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(simResult)) throw new Error(`Simulate failed: ${simResult.error}`)
  if (!simResult.result) return null
  return scValToNative(simResult.result.retval)
}

// ── Job contract ──────────────────────────────────────────────

export async function postJob(
  caller: string,
  title: string,
  description: string,
  budgetXlm: number,
  deadlineUnix: number
): Promise<number> {
  if (deadlineUnix <= 0) throw new Error('Deadline must be a future timestamp')
  const result = await invoke(caller, CONTRACT_ADDRESSES.job, 'post_job', [
    new Address(caller).toScVal(),
    nativeToScVal(title, { type: 'string' }),
    nativeToScVal(description, { type: 'string' }),
    nativeToScVal(xlmToStroops(budgetXlm), { type: 'i128' }),
    nativeToScVal(BigInt(deadlineUnix), { type: 'u64' }),
  ])
  return result.returnValue ? Number(scValToNative(result.returnValue)) : 0
}

export async function getJob(caller: string, jobId: number) {
  return read(caller, CONTRACT_ADDRESSES.job, 'get', [
    nativeToScVal(jobId, { type: 'u32' }),
  ])
}

export async function applyToJob(caller: string, jobId: number, proposal: string) {
  return invoke(caller, CONTRACT_ADDRESSES.job, 'apply', [
    new Address(caller).toScVal(),
    nativeToScVal(jobId, { type: 'u32' }),
    nativeToScVal(proposal, { type: 'string' }),
  ])
}

export async function hireFreelancer(caller: string, jobId: number, freelancer: string) {
  return invoke(caller, CONTRACT_ADDRESSES.job, 'hire', [
    new Address(caller).toScVal(),
    nativeToScVal(jobId, { type: 'u32' }),
    new Address(freelancer).toScVal(),
  ])
}

// ── Milestone contract ────────────────────────────────────────

export async function createMilestone(
  caller: string,
  jobId: number,
  description: string,
  amountXlm: number,
  deadlineUnix: number
): Promise<number> {
  if (deadlineUnix <= 0) throw new Error('Deadline must be a future timestamp')
  const result = await invoke(caller, CONTRACT_ADDRESSES.milestone, 'create', [
    nativeToScVal(jobId, { type: 'u32' }),
    nativeToScVal(description, { type: 'string' }),
    nativeToScVal(xlmToStroops(amountXlm), { type: 'i128' }),
    nativeToScVal(BigInt(deadlineUnix), { type: 'u64' }),
  ])
  return result.returnValue ? Number(scValToNative(result.returnValue)) : 0
}

export async function submitMilestone(caller: string, milestoneId: number, proofUrl: string) {
  return invoke(caller, CONTRACT_ADDRESSES.milestone, 'submit', [
    new Address(caller).toScVal(),
    nativeToScVal(milestoneId, { type: 'u32' }),
    nativeToScVal(proofUrl, { type: 'string' }),
  ])
}

export async function approveMilestone(caller: string, milestoneId: number) {
  return invoke(caller, CONTRACT_ADDRESSES.milestone, 'approve', [
    new Address(caller).toScVal(),
    nativeToScVal(milestoneId, { type: 'u32' }),
  ])
}

export async function requestRevision(caller: string, milestoneId: number, feedback: string) {
  return invoke(caller, CONTRACT_ADDRESSES.milestone, 'request_revision', [
    new Address(caller).toScVal(),
    nativeToScVal(milestoneId, { type: 'u32' }),
    nativeToScVal(feedback, { type: 'string' }),
  ])
}

export async function disputeMilestone(caller: string, milestoneId: number) {
  return invoke(caller, CONTRACT_ADDRESSES.milestone, 'dispute', [
    new Address(caller).toScVal(),
    nativeToScVal(milestoneId, { type: 'u32' }),
  ])
}

// ── Escrow contract ───────────────────────────────────────────

export async function depositEscrow(
  caller: string,
  freelancer: string,
  amountXlm: number,
  milestoneId: number
) {
  return invoke(caller, CONTRACT_ADDRESSES.escrow, 'deposit', [
    new Address(caller).toScVal(),
    new Address(freelancer).toScVal(),
    nativeToScVal(xlmToStroops(amountXlm), { type: 'i128' }),
    new Address(XLM_TOKEN).toScVal(),
    nativeToScVal(milestoneId, { type: 'u32' }),
  ])
}

export async function releaseEscrow(caller: string, milestoneId: number) {
  return invoke(caller, CONTRACT_ADDRESSES.escrow, 'release', [
    new Address(caller).toScVal(),
    nativeToScVal(milestoneId, { type: 'u32' }),
  ])
}

export async function cancelEscrow(caller: string, milestoneId: number) {
  return invoke(caller, CONTRACT_ADDRESSES.escrow, 'cancel', [
    new Address(caller).toScVal(),
    nativeToScVal(milestoneId, { type: 'u32' }),
  ])
}

// ── Project Vault contract ────────────────────────────────────

export interface VaultParticipant {
  wallet: string
  bps: number // basis points, 10000 = 100%
}

export async function createVault(
  caller: string,
  token: string,
  totalXlm: number,
  participants: VaultParticipant[]
): Promise<number> {
  for (const p of participants) {
    if (!STELLAR_ADDR.test(p.wallet)) throw new Error(`Invalid wallet address: ${p.wallet}`)
  }

  const participantsScVal = xdr.ScVal.scvVec(
    participants.map((p) =>
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: nativeToScVal('wallet', { type: 'symbol' }),
          val: new Address(p.wallet).toScVal(),
        }),
        new xdr.ScMapEntry({
          key: nativeToScVal('bps', { type: 'symbol' }),
          val: nativeToScVal(p.bps, { type: 'u32' }),
        }),
      ])
    )
  )

  const result = await invoke(caller, CONTRACT_ADDRESSES.project_vault, 'create', [
    new Address(caller).toScVal(),
    new Address(token).toScVal(),
    nativeToScVal(xlmToStroops(totalXlm), { type: 'i128' }),
    participantsScVal,
  ])
  return result.returnValue ? Number(scValToNative(result.returnValue)) : 0
}

export async function fundVault(caller: string, vaultId: number, amountXlm: number) {
  return invoke(caller, CONTRACT_ADDRESSES.project_vault, 'fund', [
    new Address(caller).toScVal(),
    nativeToScVal(vaultId, { type: 'u32' }),
    nativeToScVal(xlmToStroops(amountXlm), { type: 'i128' }),
  ])
}

export async function addVaultMilestone(
  caller: string,
  vaultId: number,
  description: string,
  amountXlm: number
): Promise<number> {
  const result = await invoke(caller, CONTRACT_ADDRESSES.project_vault, 'add_milestone', [
    new Address(caller).toScVal(),
    nativeToScVal(vaultId, { type: 'u32' }),
    nativeToScVal(description, { type: 'string' }),
    nativeToScVal(xlmToStroops(amountXlm), { type: 'i128' }),
  ])
  return result.returnValue ? Number(scValToNative(result.returnValue)) : 0
}

export async function submitVaultMilestone(
  caller: string,
  vaultId: number,
  milestoneIdx: number,
  proofUrl: string
) {
  return invoke(caller, CONTRACT_ADDRESSES.project_vault, 'submit_milestone', [
    new Address(caller).toScVal(),
    nativeToScVal(vaultId, { type: 'u32' }),
    nativeToScVal(milestoneIdx, { type: 'u32' }),
    nativeToScVal(proofUrl, { type: 'string' }),
  ])
}

export async function approveVaultMilestone(
  caller: string,
  vaultId: number,
  milestoneIdx: number
) {
  return invoke(caller, CONTRACT_ADDRESSES.project_vault, 'approve_milestone', [
    new Address(caller).toScVal(),
    nativeToScVal(vaultId, { type: 'u32' }),
    nativeToScVal(milestoneIdx, { type: 'u32' }),
  ])
}

export async function claimVaultTimeout(caller: string, vaultId: number, milestoneIdx: number) {
  return invoke(caller, CONTRACT_ADDRESSES.project_vault, 'claim_timeout', [
    new Address(caller).toScVal(),
    nativeToScVal(vaultId, { type: 'u32' }),
    nativeToScVal(milestoneIdx, { type: 'u32' }),
  ])
}

export async function disputeVaultMilestone(
  caller: string,
  vaultId: number,
  milestoneIdx: number
) {
  return invoke(caller, CONTRACT_ADDRESSES.project_vault, 'dispute_milestone', [
    new Address(caller).toScVal(),
    nativeToScVal(vaultId, { type: 'u32' }),
    nativeToScVal(milestoneIdx, { type: 'u32' }),
  ])
}

export async function getVault(caller: string, vaultId: number) {
  return read(caller, CONTRACT_ADDRESSES.project_vault, 'get_vault', [
    nativeToScVal(vaultId, { type: 'u32' }),
  ])
}

export async function getVaultMilestone(caller: string, vaultId: number, milestoneIdx: number) {
  return read(caller, CONTRACT_ADDRESSES.project_vault, 'get_milestone', [
    nativeToScVal(vaultId, { type: 'u32' }),
    nativeToScVal(milestoneIdx, { type: 'u32' }),
  ])
}

// ── Reputation contract ───────────────────────────────────────

export async function getReputation(caller: string, wallet: string) {
  const [score, count] = await Promise.all([
    read(caller, CONTRACT_ADDRESSES.reputation, 'get_score', [new Address(wallet).toScVal()]),
    read(caller, CONTRACT_ADDRESSES.reputation, 'get_count', [new Address(wallet).toScVal()]),
  ])
  return { score: Number(score ?? 0), count: Number(count ?? 0) }
}
