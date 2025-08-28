import { Horizon, rpc } from '@stellar/stellar-sdk'

export const server = new Horizon.Server(
  process.env.NEXT_PUBLIC_HORIZON_URL ?? 'https://horizon-testnet.stellar.org'
)

export const rpcServer = new rpc.Server(
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org'
)

export const CONTRACT_ADDRESSES = {
  escrow:     process.env.NEXT_PUBLIC_CONTRACT_ESCROW!,
  job:        process.env.NEXT_PUBLIC_CONTRACT_JOB!,
  milestone:  process.env.NEXT_PUBLIC_CONTRACT_MILESTONE!,
  reputation: process.env.NEXT_PUBLIC_CONTRACT_REPUTATION!,
} as const

export const XLM_TOKEN = process.env.NEXT_PUBLIC_XLM_TOKEN!

export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'

export async function getAccount(publicKey: string) {
  return server.loadAccount(publicKey)
}
