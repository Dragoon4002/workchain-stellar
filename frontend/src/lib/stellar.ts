import { Horizon } from '@stellar/stellar-sdk'

export const server = new Horizon.Server('https://horizon-testnet.stellar.org')

export const CONTRACT_ADDRESSES = {
  escrow: 'PLACEHOLDER_ESCROW',
  job: 'PLACEHOLDER_JOB',
  milestone: 'PLACEHOLDER_MILESTONE',
  reputation: 'PLACEHOLDER_REPUTATION',
} as const

export async function getAccount(publicKey: string) {
  return server.loadAccount(publicKey)
}
