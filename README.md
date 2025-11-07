# ReVaultron Frontend

> Multi-Agent Autonomous Portfolio Management Dashboard on Hedera

[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Hedera SDK](https://img.shields.io/badge/Hedera_SDK-2.49-green)](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-black)](https://ui.shadcn.com/)

## 🎯 Overview

The ReVaultron frontend provides a comprehensive dashboard for managing autonomous cryptocurrency portfolios on Hedera. Users can create vaults, configure AI agents, monitor real-time volatility, and track automatic rebalancing—all through an intuitive interface.

**Key Features:**
- 🔐 Hedera wallet integration (HashPack, Blade)
- 📊 Real-time portfolio monitoring with live charts
- 🤖 Agent activity feed via HCS subscriptions
- ⚡ Instant rebalancing notifications
- 💼 Individual vault management
- 📈 Historical performance analytics

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
VITE_HEDERA_NETWORK=testnet                    # or 'mainnet'
VITE_HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# Contract Addresses (Deployed on Hedera)
VITE_VAULT_FACTORY_ADDRESS=0x...
VITE_VOLATILITY_INDEX_ADDRESS=0x...
VITE_PORTFOLIO_MANAGER_AGENT=0x...
VITE_EXECUTION_AGENT_ADDRESS=0x...
VITE_RISK_ASSESSMENT_AGENT=0x...

# HCS Topics
VITE_HCS_VOLATILITY_TOPIC=0.0.123456
VITE_HCS_PORTFOLIO_TOPIC=0.0.123457
VITE_HCS_RISK_TOPIC=0.0.123458
VITE_HCS_EXECUTION_TOPIC=0.0.123459
VITE_HCS_AUDIT_TOPIC=0.0.123460

# Token IDs (Hedera Token Service)
VITE_HBAR_TOKEN_ID=0.0.0                       # Native HBAR
VITE_USDC_TOKEN_ID=0.0.456789
VITE_SAUCE_TOKEN_ID=0.0.456790

# DEX Configuration
VITE_SAUCERSWAP_ROUTER=0x...

# API Keys (Optional)
VITE_PYTH_API_KEY=your_pyth_api_key            # For direct price feeds
```

### Development

```bash
# Start development server
npm run dev

# Open browser at http://localhost:5173
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview

# Deploy to hosting (Vercel, Netlify, etc.)
npm run deploy
```

---

## 🔌 Core Integrations

### 1. Wallet Connection

**Supported Wallets:**
- HashPack (Recommended)
- Blade Wallet
- WalletConnect (coming soon)

**Implementation:**

```typescript
// hooks/useHedera.ts
import { HashConnect } from 'hashconnect';

export function useHedera() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const connectWallet = async (walletType: 'hashpack' | 'blade') => {
    if (walletType === 'hashpack') {
      const hashconnect = new HashConnect();
      await hashconnect.init();
      const state = await hashconnect.connect();
      setAccountId(state.pairingData[0].accountIds[0]);
    }
    // Similar for Blade wallet
  };

  return { accountId, client, connectWallet };
}
```

### 2. HCS Message Streaming

**Real-time Agent Activity:**

```typescript
// hooks/useHCS.ts
import { TopicMessageQuery } from '@hashgraph/sdk';

export function useHCS(topicId: string) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);

  useEffect(() => {
    const query = new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0);

    query.subscribe(client, null, (message) => {
      const payload = JSON.parse(
        Buffer.from(message.contents).toString()
      );
      setMessages((prev) => [...prev, payload]);
    });

    return () => query.unsubscribe();
  }, [topicId]);

  return messages;
}
```

### 3. Smart Contract Interactions

**Vault Operations:**

```typescript
// lib/hedera/contracts.ts
import { ethers } from 'ethers';

export class VaultContract {
  private contract: ethers.Contract;

  async createVault(
    tokens: string[],
    allocations: number[],
    threshold: number
  ) {
    const tx = await this.contract.createVault(
      tokens,
      allocations,
      threshold
    );
    return tx.wait();
  }

  async getVaultInfo(vaultAddress: string) {
    return await this.contract.getVault(vaultAddress);
  }

  async executeDeposit(
    vaultAddress: string,
    tokenId: string,
    amount: bigint
  ) {
    // HTS token transfer implementation
  }
}
```

---

## 🎨 UI Components

### Dashboard Components

#### 1. **Portfolio Overview**

Displays total portfolio value, 24h change, and allocation breakdown.

```tsx
<PortfolioOverview
  totalValue={2200}
  change24h={3.2}
  allocations={[
    { token: 'HBAR', percentage: 48.5, target: 50 },
    { token: 'USDC', percentage: 51.5, target: 50 }
  ]}
/>
```

#### 2. **Volatility Monitor**

Real-time volatility tracking with threshold indicator.

```tsx
<VolatilityMonitor
  currentVolatility={24.3}
  userThreshold={30}
  lastUpdate={new Date()}
  status="NORMAL" // or "WARNING" | "ALERT"
/>
```

#### 3. **Agent Activity Feed**

Live stream of agent messages from HCS topics.

```tsx
<AgentActivityFeed
  messages={agentMessages}
  onMessageClick={(msg) => showDetails(msg)}
  filterByAgent={selectedAgent}
/>
```

### Vault Creation Components

#### 4. **Vault Creation Wizard**

4-step guided setup process:

```tsx
<VaultCreationWizard
  onComplete={(vaultConfig) => handleVaultCreation(vaultConfig)}
>
  <Step1TokenSelection />
  <Step2AllocationSettings />
  <Step3VolatilityThreshold />
  <Step4ReviewAndConfirm />
</VaultCreationWizard>
```

#### 5. **Allocation Slider**

Visual allocation percentage control with validation.

```tsx
<AllocationSlider
  tokens={['HBAR', 'USDC']}
  allocations={[50, 50]}
  onChange={(newAllocations) => setAllocations(newAllocations)}
  min={5}
  max={95}
/>
```

### Agent Components

#### 6. **Rebalancing Progress Tracker**

Live progress during automatic rebalancing.

```tsx
<RebalancingProgress
  status="EXECUTING" // DETECTING | ANALYZING | APPROVING | EXECUTING | COMPLETE
  steps={[
    { agent: 'Volatility Oracle', status: 'complete', time: '02:05 AM' },
    { agent: 'Portfolio Manager', status: 'complete', time: '02:06 AM' },
    { agent: 'Risk Assessment', status: 'complete', time: '02:07 AM' },
    { agent: 'Execution Agent', status: 'in-progress', time: '02:08 AM' }
  ]}
  swapDetails={{
    sell: { token: 'USDC', amount: 250 },
    buy: { token: 'HBAR', amount: 2083 }
  }}
/>
```

---

## 📊 Data Flow

### Wallet Connection Flow

```
User clicks "Connect Wallet"
    ↓
Frontend initiates HashConnect/Blade
    ↓
User approves pairing in wallet app
    ↓
Frontend receives account ID + signer
    ↓
Check for existing vault (VaultFactory.getUserVault)
    ↓
Navigate to Dashboard or Vault Creation
```

### Vault Creation Flow

```
User completes 4-step wizard
    ↓
Frontend validates configuration
    ↓
Call VaultFactory.createVault()
    ↓
User signs transaction in wallet
    ↓
Wait for Hedera consensus (3-5s)
    ↓
Vault deployed, address returned
    ↓
Navigate to Dashboard with new vault
```

### Real-Time Monitoring Flow

```
Dashboard loads
    ↓
Subscribe to HCS topics via useHCS hook
    ↓
Volatility Oracle publishes update (every 10min)
    ↓
Frontend receives message via HCS subscription
    ↓
Update volatility chart + check user threshold
    ↓
If threshold exceeded:
    ↓
Show "Rebalancing in Progress" notification
    ↓
Subscribe to execution topic for live updates
    ↓
Display completion summary when done
```

---

## 🎭 User Experience Features

### 1. **Responsive Design**

- Mobile-first approach
- Tablet-optimized layouts
- Desktop multi-column views

### 2. **Real-Time Updates**

- WebSocket-like HCS subscriptions
- Optimistic UI updates
- Loading states for all async operations

### 3. **Transaction Feedback**

- Toast notifications for tx status
- Progress indicators during signing
- Error handling with retry options

### 4. **Accessibility**

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatible

### 5. **Dark Mode**

- System preference detection
- Manual toggle available
- Persistent user preference

---

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Example Test:**

```typescript
// components/vault/AllocationSlider.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AllocationSlider } from './AllocationSlider';

describe('AllocationSlider', () => {
  it('updates allocations when slider moves', () => {
    const onChange = jest.fn();
    render(
      <AllocationSlider
        tokens={['HBAR', 'USDC']}
        allocations={[50, 50]}
        onChange={onChange}
      />
    );

    const slider = screen.getByRole('slider', { name: /HBAR/ });
    fireEvent.change(slider, { target: { value: 60 } });

    expect(onChange).toHaveBeenCalledWith([60, 40]);
  });
});
```

### Integration Tests

```bash
# Run integration tests with Hedera testnet
npm run test:integration
```

### E2E Tests (Playwright)

```bash
# Run end-to-end tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed
```

**Example E2E Test:**

```typescript
// e2e/vault-creation.spec.ts
import { test, expect } from '@playwright/test';

test('user can create a vault', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Connect wallet (mock)
  await page.click('text=Connect Wallet');
  await page.click('text=HashPack');
  
  // Navigate to vault creation
  await page.click('text=Create Vault');
  
  // Step 1: Select tokens
  await page.check('input[value="HBAR"]');
  await page.check('input[value="USDC"]');
  await page.click('text=Next');
  
  // Step 2: Set allocations
  await page.fill('input[name="HBAR-allocation"]', '50');
  await page.fill('input[name="USDC-allocation"]', '50');
  await page.click('text=Next');
  
  // Step 3: Volatility threshold
  await page.fill('input[name="threshold"]', '30');
  await page.click('text=Next');
  
  // Step 4: Review and create
  await expect(page.locator('text=Review Your Vault')).toBeVisible();
  await page.click('text=Create Vault');
  
  // Wait for transaction
  await expect(page.locator('text=Vault Created Successfully')).toBeVisible({
    timeout: 10000
  });
});
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
        hedera: {
          purple: '#8B5CF6',
          green: '#10B981',
          blue: '#3B82F6'
        },
        agent: {
          volatility: '#F59E0B',
          portfolio: '#8B5CF6',
          risk: '#EF4444',
          execution: '#10B981'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib')
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true
  },
  optimizeDeps: {
    exclude: ['@hashgraph/sdk']
  }
});
```

---

## 📦 Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@hashgraph/sdk": "^2.49.0",
    "hashconnect": "^0.8.0",
    "ethers": "^6.11.1",
    "zustand": "^4.5.0",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.22.0",
    "recharts": "^2.12.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^3.3.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "@testing-library/react": "^14.2.1",
    "@testing-library/jest-dom": "^6.4.2",
    "vitest": "^1.2.2",
    "@playwright/test": "^1.41.2",
    "eslint": "^8.56.0",
    "prettier": "^3.2.5"
  }
}
```

---

## 🚢 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Environment variables are configured in Vercel dashboard
```

### Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configure build settings
# Build command: npm run build
# Publish directory: dist
```

### IPFS Deployment (Decentralized)

```bash
# Build for production
npm run build

# Upload to IPFS via Pinata/Web3.Storage
npx ipfs-deploy dist/

# Get IPFS hash (e.g., Qm...)
# Access via: https://ipfs.io/ipfs/Qm...
```

---

## 🔐 Security Considerations

### 1. **Private Key Management**

- Never store private keys in frontend code
- Use wallet signers for all transactions
- Implement transaction preview before signing

### 2. **Input Validation**

- Validate all user inputs (allocations, amounts)
- Sanitize HCS message data before rendering
- Implement rate limiting for API calls

### 3. **Contract Address Verification**

- Hardcode contract addresses in environment
- Verify contract bytecode on first load
- Implement address whitelist for agent contracts

### 4. **XSS Prevention**

- Sanitize all dynamic content
- Use Content Security Policy headers
- Avoid dangerouslySetInnerHTML

---

## 📚 Key Libraries & Tools

### UI Components: shadcn/ui

Pre-built, accessible components built on Radix UI:

```bash
# Install shadcn/ui components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add slider
```

### State Management: Zustand

Lightweight state management:

```typescript
// stores/vaultStore.ts
import create from 'zustand';

interface VaultState {
  vaultAddress: string | null;
  setVaultAddress: (address: string) => void;
  portfolioValue: number;
  updatePortfolioValue: (value: number) => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  vaultAddress: null,
  setVaultAddress: (address) => set({ vaultAddress: address }),
  portfolioValue: 0,
  updatePortfolioValue: (value) => set({ portfolioValue: value })
}));
```

### Charts: Recharts

Responsive, declarative charts:

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={volatilityHistory}>
    <XAxis dataKey="timestamp" />
    <YAxis />
    <Tooltip />
    <Line 
      type="monotone" 
      dataKey="volatility" 
      stroke="#8B5CF6" 
      strokeWidth={2} 
    />
    <ReferenceLine 
      y={userThreshold} 
      stroke="#EF4444" 
      strokeDasharray="3 3" 
      label="Your Threshold" 
    />
  </LineChart>
</ResponsiveContainer>
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Wallet Connection Fails**

```
Error: Failed to initialize HashConnect
```

**Solution:**
- Ensure HashPack extension is installed
- Check if popup blocker is enabled
- Verify network selection (testnet/mainnet)

#### 2. **HCS Messages Not Appearing**

```
Error: TopicMessageQuery subscription failed
```

**Solution:**
- Verify HCS topic IDs in .env
- Check Hedera client initialization
- Ensure mirror node URL is correct

#### 3. **Transaction Signing Timeout**

```
Error: User rejected transaction
```

**Solution:**
- Increase transaction timeout in HashConnect config
- Check wallet app is open and unlocked
- Verify sufficient HBAR balance for fees

#### 4. **Contract Call Reverts**

```
Error: execution reverted: "Invalid agent proof"
```

**Solution:**
- Verify contract addresses are correct
- Check agent authorization status
- Ensure vault is properly initialized

---

## 📖 Additional Resources

### Documentation Links

- [Hedera SDK Documentation](https://docs.hedera.com/hedera/sdks-and-apis/sdks)
- [HashConnect Guide](https://github.com/Hashpack/hashconnect)
- [Hedera Consensus Service](https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts Examples](https://recharts.org/en-US/examples)

### Community

- [Hedera Discord](https://discord.gg/hedera)
- [ReVaultron GitHub Issues](https://github.com/yourusername/ReVaultron-hedera/issues)
- [Hedera Developer Portal](https://portal.hedera.com/)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test thoroughly
4. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hedera** for the enterprise-grade DLT infrastructure
- **shadcn** for the beautiful UI components
- **HashPack** team for wallet integration support
- **Hello Future Hackathon** for the opportunity

---

**Built with ❤️ for the Hedera ecosystem**

For questions or support, reach out on [Discord](https://discord.gg/hedera) or open an [issue](https://github.com/yourusername/ReVaultron-hedera/issues).