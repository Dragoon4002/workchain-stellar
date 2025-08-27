import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter'

// ponytail: static init, call once at module load
StellarWalletsKit.init({
  modules: [new FreighterModule()],
  network: Networks.TESTNET,
  selectedWalletId: FREIGHTER_ID,
})

export { StellarWalletsKit, FREIGHTER_ID }

export function shortenAddress(addr: string): string {
  if (!addr) return ''
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}
