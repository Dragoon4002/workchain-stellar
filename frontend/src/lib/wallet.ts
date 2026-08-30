import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter'

if (typeof window !== 'undefined') {
  StellarWalletsKit.init({
    modules: [new FreighterModule()],
    network: Networks.TESTNET,
    selectedWalletId: FREIGHTER_ID,
  })

  StellarWalletsKit.setTheme({
    'background': '#111111',
    'background-secondary': '#1a1a1a',
    'foreground-strong': '#ffffff',
    'foreground': '#ffffffee',
    'foreground-secondary': 'rgba(255,255,255,0.6)',
    'primary': '#dddddd',
    'primary-foreground': '#000000',
    'transparent': 'rgba(0,0,0,0)',
    'lighter': '#1e1e1e',
    'light': '#1a1a1a',
    'light-gray': 'rgba(255,255,255,0.15)',
    'gray': 'rgba(255,255,255,0.3)',
    'danger': 'oklch(57.7% 0.245 27.325)',
    'border': 'rgba(255,255,255,0.1)',
    'shadow': '0 10px 40px rgba(0,0,0,0.6)',
    'border-radius': '12px',
    'font-family': 'Inter, sans-serif',
  })
}

export { StellarWalletsKit, FREIGHTER_ID }

export function shortenAddress(addr: string): string {
  if (!addr) return ''
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}
