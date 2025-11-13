// services/appKitService.ts
import type UniversalProvider from "@walletconnect/universal-provider";
import {
  HederaProvider,
  HederaAdapter,
  HederaChainDefinition,
  hederaNamespace,
} from "@hashgraph/hedera-wallet-connect";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet } from "@reown/appkit/networks";

import {
  PROJECT_ID,
  metadata,
  evmNetworks,
  allNetworks,
  appKitTheme,
} from "../lib/wallet/walletConfig";
import {
  setupWalletEventListeners,
  detectWalletProviders,
} from "../lib/walletEvents";
import type { AppKit } from "@reown/appkit/react";

export interface AppKitInitResult {
  appKit: AppKit;
  universalProvider: UniversalProvider;
}

export const initializeAppKit = async (): Promise<AppKitInitResult> => {
  if (!PROJECT_ID) {
    throw new Error(
      "Please set your WalletConnect Project ID in the environment variables"
    );
  }

  console.log("🚀 Initializing AppKit...");

  // Initialize Universal Provider for Hedera
  const hederaUniversalProvider = (await HederaProvider.init({
    projectId: PROJECT_ID,
    metadata,
  })) as unknown as UniversalProvider;

  console.log("🔗 Hedera Universal Provider initialized");

  // Create Wagmi adapter for EVM chains
  const wagmiAdapter = new WagmiAdapter({
    networks: evmNetworks,
    projectId: PROJECT_ID,
  });

  console.log("⚡ Wagmi adapter created");

  // Create Hedera EVM Adapter
  const hederaEVMAdapter = new HederaAdapter({
    projectId: PROJECT_ID,
    networks: [
      // HederaChainDefinition.EVM.Mainnet,
      HederaChainDefinition.EVM.Testnet,
    ],
    namespace: "eip155",
  });

  // Create Hedera Native Adapter
  const hederaNativeAdapter = new HederaAdapter({
    projectId: PROJECT_ID,
    networks: [
      // HederaChainDefinition.Native.Mainnet,
      HederaChainDefinition.Native.Testnet,
    ],
    namespace: hederaNamespace,
  });

  console.log("🔷 Hedera adapters created");

  // Create AppKit instance with all networks and adapters
  const appKitInstance = createAppKit({
    adapters: [wagmiAdapter as any, hederaEVMAdapter, hederaNativeAdapter],
    // @ts-expect-error expected type error for universal provider
    universalProvider: hederaUniversalProvider,
    projectId: PROJECT_ID,
    metadata,
    networks: allNetworks as [(typeof allNetworks)[0], ...typeof allNetworks],
    defaultNetwork: mainnet, // Set default network
    ...appKitTheme,
  });

  console.log("🎯 AppKit instance created with comprehensive wallet support");

  // Setup event listeners
  setupWalletEventListeners(hederaUniversalProvider);

  // Detect wallet providers
  detectWalletProviders();

  console.log("✅ AppKit fully initialized with comprehensive wallet support");

  return {
    appKit: appKitInstance,
    universalProvider: hederaUniversalProvider,
  };
};
