// /walletConfig.ts
import { mainnet, sepolia, polygon, polygonZkEvm, base, baseSepolia, rootstock, rootstockTestnet } from '@reown/appkit/networks';
import { HederaChainDefinition } from '@hashgraph/hedera-wallet-connect';

// Replace with your actual WalletConnect Project ID
export const PROJECT_ID = "7cbcd2275e7647c89784f60dff9b36b5";

export const metadata = {
  name: 'ReVaultron',
  description: 'Multi-Agent Autonomous Portfolio Management on Hedera',
  url: 'https://revaultron.com',
  icons: ['https://revaultron.com/icon.png']
};

// Custom Hedera EVM networks
export const hederaMainnet = {
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hashio.io/api'],
    },
    public: {
      http: ['https://mainnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io',
    },
  },
};

export const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
    public: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan Testnet',
      url: 'https://hashscan.io/testnet',
    },
  },
};

// All supported networks
export const evmNetworks = [
  mainnet,
  sepolia,
  baseSepolia,
  polygonZkEvm,
  hederaMainnet,
  hederaTestnet,
  rootstock,
  rootstockTestnet,
  polygon,
  base,
];

export const hederaNativeNetworks = [
  HederaChainDefinition.Native.Mainnet,
  HederaChainDefinition.Native.Testnet,
];

export const allNetworks = [
  ...evmNetworks,
  ...hederaNativeNetworks,
];

export const appKitTheme = {
  themeMode: 'dark' as const,
  themeVariables: {
    '--w3m-color-mix': '#1a1a1a',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#3b82f6',
    '--w3m-border-radius-master': '8px',
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
};