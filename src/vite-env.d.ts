/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID: string;
  readonly VITE_HEDERA_NETWORK: string;
  readonly VITE_HEDERA_MIRROR_NODE_URL: string;
  readonly VITE_VAULT_FACTORY_ADDRESS: string;
  readonly VITE_VOLATILITY_INDEX_ADDRESS: string;
  readonly VITE_PORTFOLIO_MANAGER_AGENT: string;
  readonly VITE_EXECUTION_AGENT_ADDRESS: string;
  readonly VITE_RISK_ASSESSMENT_AGENT: string;
  readonly VITE_HCS_VOLATILITY_TOPIC: string;
  readonly VITE_HCS_PORTFOLIO_TOPIC: string;
  readonly VITE_HCS_RISK_TOPIC: string;
  readonly VITE_HCS_EXECUTION_TOPIC: string;
  readonly VITE_HCS_AUDIT_TOPIC: string;
  readonly VITE_HBAR_TOKEN_ID: string;
  readonly VITE_USDC_TOKEN_ID: string;
  readonly VITE_SAUCE_TOKEN_ID: string;
  readonly VITE_SAUCERSWAP_ROUTER: string;
  readonly VITE_PYTH_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ethereum?: any;
  Buffer?: typeof Buffer;
  global?: any;
  process?: any;
}