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

export function xlmToStroops(xlm: number): bigint {
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
): Promise<unknown> {
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

  const result = await rpcServer.sendTransaction(
    TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)
  )
  return result
}

async function read(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[]
): Promise<unknown> {
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
  const result = await invoke(caller, CONTRACT_ADDRESSES.job, 'post_job', [
    new Address(caller).toScVal(),
    nativeToScVal(title, { type: 'string' }),
    nativeToScVal(description, { type: 'string' }),
    nativeToScVal(xlmToStroops(budgetXlm), { type: 'i128' }),
    nativeToScVal(BigInt(deadlineUnix), { type: 'u64' }),
  ])
  const ret = (result as { returnValue?: xdr.ScVal }).returnValue
  return ret ? Number(scValToNative(ret)) : 0
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
  const result = await invoke(caller, CONTRACT_ADDRESSES.milestone, 'create', [
    nativeToScVal(jobId, { type: 'u32' }),
    nativeToScVal(description, { type: 'string' }),
    nativeToScVal(xlmToStroops(amountXlm), { type: 'i128' }),
    nativeToScVal(BigInt(deadlineUnix), { type: 'u64' }),
  ])
  const ret = (result as { returnValue?: xdr.ScVal }).returnValue
  return ret ? Number(scValToNative(ret)) : 0
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

// ── Reputation contract ───────────────────────────────────────

export async function getReputation(caller: string, wallet: string) {
  const [score, count] = await Promise.all([
    read(caller, CONTRACT_ADDRESSES.reputation, 'get_score', [new Address(wallet).toScVal()]),
    read(caller, CONTRACT_ADDRESSES.reputation, 'get_count', [new Address(wallet).toScVal()]),
  ])
  return { score: Number(score ?? 0), count: Number(count ?? 0) }
}
