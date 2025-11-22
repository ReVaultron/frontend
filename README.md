# ReVaultron Frontend

> AI-Powered Autonomous Portfolio Management Dashboard on Hedera

[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Hedera](https://img.shields.io/badge/Hedera-Testnet-green)](https://hedera.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-black)](https://ui.shadcn.com/)

## 🎯 Overview

ReVaultron frontend provides a comprehensive dashboard for managing AI-powered cryptocurrency portfolios on Hedera. Create vaults, configure autonomous agents, monitor real-time volatility, and track automatic rebalancing through an intuitive interface.

**Key Features:**
- 🔐 MetaMask wallet integration for Hedera testnet
- 📊 Real-time portfolio monitoring with live price feeds
- 🤖 AI agent activity tracking and status monitoring
- ⚡ Automated rebalancing notifications
- 💼 Multi-token vault management
- 📈 Historical volatility and performance analytics

---

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx           # Main dashboard view
│   │   │   ├── PortfolioOverview.tsx   # Value & allocation summary
│   │   │   ├── VolatilityMonitor.tsx   # Real-time volatility display
│   │   │   └── AllocationChart.tsx     # Visual allocation breakdown
│   │   ├── vault/
│   │   │   ├── VaultCreationWizard.tsx # 4-step vault setup
│   │   │   ├── TokenSelector.tsx       # Token selection interface
│   │   │   ├── AllocationSlider.tsx    # Allocation percentage controls
│   │   │   └── DepositInterface.tsx    # Deposit/withdrawal UI
│   │   ├── agents/
│   │   │   ├── AgentActivityFeed.tsx   # Live HCS message stream
│   │   │   ├── AgentAuthorizationCard.tsx
│   │   │   └── RebalancingProgress.tsx # Live rebalancing tracker
│   │   ├── wallet/
│   │   │   ├── WalletConnect.tsx       # Multi-wallet connection
│   │   │   └── AccountDisplay.tsx      # Account info display
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── TransactionToast.tsx
│   ├── hooks/
│   │   ├── useHedera.ts               # Hedera client management
│   │   ├── useHCS.ts                  # HCS topic subscriptions
│   │   ├── useVault.ts                # Vault contract interactions
│   │   ├── useAgents.ts               # Agent status tracking
│   │   └── usePortfolio.ts            # Portfolio calculations
│   ├── lib/
│   │   ├── hedera/
│   │   │   ├── client.ts              # Hedera SDK wrapper
│   │   │   ├── hcs.ts                 # HCS message handling
│   │   │   ├── hts.ts                 # Token transfers
│   │   │   └── contracts.ts           # Smart contract ABIs
│   │   ├── wallet/
│   │   │   ├── hashpack.ts            # HashPack integration
│   │   │   └── blade.ts               # Blade wallet integration
│   │   └── utils/
│   │       ├── formatting.ts          # Number/date formatting
│   │       ├── calculations.ts        # Portfolio math
│   │       └── constants.ts           # Contract addresses, etc.
│   ├── types/
│   │   ├── vault.ts                   # Vault data types
│   │   ├── agent.ts                   # Agent message types
│   │   └── portfolio.ts               # Portfolio types
│   ├── stores/
│   │   ├── walletStore.ts             # Wallet state (Zustand)
│   │   ├── vaultStore.ts              # Vault state
│   │   └── agentStore.ts              # Agent activity state
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── assets/
│   │   └── agent-icons/               # Agent avatars
│   └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```
---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
MetaMask wallet extension
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ReVaultron-hedera
cd ReVaultron-hedera/frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Configuration

```bash
# .env.local

# Network Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=296                       # Hedera Testnet EVM chain ID

# Contract Addresses (Deployed on Hedera Testnet)
NEXT_PUBLIC_VAULT_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_VOLATILITY_INDEX_ADDRESS=0x...
NEXT_PUBLIC_REBALANCE_EXECUTOR_ADDRESS=0x...

# Agent System (Local development)
NEXT_PUBLIC_AGENT_BASE_URL=http://localhost    # Agent server base URL

# Pyth Network Configuration
NEXT_PUBLIC_PYTH_CONTRACT=0x...
NEXT_PUBLIC_PYTH_PRICE_FEED_HBAR=0x...
```

### Development

```bash
# Start development server
npm run dev

# Open browser at http://localhost:3000
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 🔌 Core Features

### 1. Wallet Connection

**MetaMask Integration for Hedera Testnet:**

```typescript
// Hedera Testnet Configuration
const HEDERA_TESTNET = {
  chainId: '0x128', // 296 in decimal
  chainName: 'Hedera Testnet',
  rpcUrls: ['https://testnet.hashio.io/api'],
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 18,
  },
  blockExplorerUrls: ['https://hashscan.io/testnet'],
};
```

**Key Features:**
- Automatic network detection and switching
- Custom network addition to MetaMask
- Account balance display in HBAR
- Transaction signing and confirmation

### 2. Vault Management

**Create and manage autonomous vaults:**

- Token selection (HBAR, USDC, ERC20)
- Allocation percentage controls
- Volatility threshold configuration
- Deposit and withdrawal interfaces
- Real-time balance tracking

### 3. AI Agent Monitoring

**Track autonomous agent activities:**

- **Volatility Advisor**: AI-powered market analysis
- **Volatility Updater**: On-chain volatility updates
- **Allocation Strategist**: Portfolio optimization
- **Rebalance Checker**: Portfolio drift detection
- **Rebalance Executor**: Automatic rebalancing

Real-time status updates via polling (10s intervals) or WebSocket connections.

### 4. Price Feeds

**Pyth Network Integration:**

- Real-time HBAR/USD price feeds
- Confidence intervals
- Price history tracking
- Volatility calculations

---

## 🎨 Key Components

### Dashboard Widgets

#### Portfolio Overview
```tsx
<MetricCard
  title="Total Deposited"
  value="$2,200"
  change={2.5}
  icon={DollarSign}
/>
```

#### Volatility Monitor
```tsx
<VolatilityMonitor
  threshold={30}
  priceFeedId={PYTH_HBAR_USD}
/>
```

#### Agent Activity Feed
```tsx
<AgentActivityFeed />
```

### Vault Components

#### Deposit/Withdraw Modals
```tsx
<HBARDepositModal
  open={open}
  onOpenChange={setOpen}
  vaultAddress={vaultAddress}
/>

<HBARWithdrawModal
  open={open}
  onOpenChange={setOpen}
  vaultAddress={vaultAddress}
/>
```

#### Token Operations
```tsx
<ERC20DepositModal
  vaultAddress={vaultAddress}
  tokenAddress={tokenAddress}
/>
```

---

## 📊 Data Flow

### Wallet Connection Flow

```
User clicks "Connect Wallet"
    ↓
Frontend checks for MetaMask
    ↓
Request network switch to Hedera Testnet
    ↓
User approves connection
    ↓
Frontend receives wallet address
    ↓
Check for existing vault
    ↓
Load dashboard with vault data
```

### Agent Monitoring Flow

```
Dashboard loads
    ↓
Start polling agent status endpoints (every 10s)
    ↓
Agent executes task
    ↓
Agent stores result in backend
    ↓
Frontend fetches updated status
    ↓
Extract latest result data
    ↓
Generate activity for feed
    ↓
Update UI with new information
```

### Rebalancing Flow

```
Volatility Updater runs (every 30s)
    ↓
Calls Volatility Advisor for AI recommendation
    ↓
Updates on-chain volatility
    ↓
Rebalance Checker detects drift > 5%
    ↓
Calls Allocation Strategist for target allocation
    ↓
Triggers Rebalance Executor
    ↓
Executes swap on SaucerSwap
    ↓
Frontend displays completion notification
```

---

## 🔧 Configuration

### Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        primary: 'hsl(var(--primary))',
        // ... shadcn/ui color system
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### Next.js Configuration

```typescript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};
```

---

## 📦 Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wagmi": "^2.5.0",
    "viem": "^2.7.0",
    "@tanstack/react-query": "^5.22.0",
    "recharts": "^2.12.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^3.3.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.1",
    "eslint": "^8.56.0",
    "prettier": "^3.2.5"
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### MetaMask Not Detecting Hedera Network

**Solution:**
1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Enter Hedera Testnet details:
   - Network Name: `Hedera Testnet`
   - RPC URL: `https://testnet.hashio.io/api`
   - Chain ID: `296`
   - Currency Symbol: `HBAR`

#### Agent Data Not Updating

**Solution:**
1. Verify agent servers are running (`npm start` in agents directory)
2. Check agent endpoints return data: `curl http://localhost:4001/status`
3. Verify CORS is enabled for your frontend URL
4. Check browser console for network errors

#### Transaction Fails with "Insufficient Funds"

**Solution:**
1. Ensure wallet has sufficient HBAR for gas fees (~0.1 HBAR minimum)
2. Check vault has tokens for withdrawal operations
3. Verify token associations are complete

#### Price Feed Not Loading

**Solution:**
1. Verify Pyth contract address in environment variables
2. Check price feed ID is correct
3. Test Pyth endpoint: `curl https://hermes.pyth.network/v2/updates/price/latest?ids[]=0x...`

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Build Settings
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

---

## 🔐 Security Best Practices

1. **Never store private keys** - All transactions use MetaMask signer
2. **Validate all inputs** - Amount validation, address checks
3. **Verify contract addresses** - Hardcoded in environment variables
4. **Rate limit API calls** - Prevent abuse of backend endpoints
5. **Sanitize user inputs** - Prevent XSS attacks

---

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Hedera Documentation](https://docs.hedera.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Pyth Network](https://pyth.network/)
- [shadcn/ui](https://ui.shadcn.com/)

### Hedera Tools
- [HashScan Explorer](https://hashscan.io/testnet)
- [Hedera Portal](https://portal.hedera.com/)
- [Hedera Faucet](https://portal.hedera.com/faucet)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📝 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ for the Hedera ecosystem**