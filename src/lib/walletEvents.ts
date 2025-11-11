// utils/walletEvents.ts
import type UniversalProvider from '@walletconnect/universal-provider';

export const setupWalletEventListeners = (universalProvider: UniversalProvider) => {
  // Connection events
  universalProvider.on('display_uri', (uri: string) => {
    console.log('🔗 WalletConnect URI generated:', uri);
  });

  universalProvider.on('session_proposal', (proposal: unknown) => {
    console.log('📋 Session proposal received:', proposal);
  });

  universalProvider.on('session_request', (request: unknown) => {
    console.log('📨 Session request:', request);
  });

  universalProvider.on('session_ping', (event: unknown) => {
    console.log('🏓 Session ping:', event);
  });

  universalProvider.on('session_event', (event: unknown) => {
    console.log('📡 Session event:', event);
  });

  universalProvider.on('session_update', (event: unknown) => {
    console.log('🔄 Session updated:', event);
  });

  universalProvider.on('session_delete', (event: unknown) => {
    console.log('🗑️ Session deleted:', event);
  });

  universalProvider.on('connect', (session: unknown) => {
    console.log('✅ Wallet connected successfully:', {
      topic: (session as unknown as { topic: string }).topic,
      accounts: (session as unknown as { namespaces: Record<string, unknown> }).namespaces,
      expiry: (session as unknown as { expiry: number }).expiry
    });
  });

  universalProvider.on('disconnect', (event: unknown) => {
    console.log('❌ Wallet disconnected:', event);
  });

  universalProvider.on('accountsChanged', (accounts: string[]) => {
    console.log('👤 Accounts changed:', accounts);
  });

  universalProvider.on('chainChanged', (chainId: string) => {
    console.log('🔄 Chain changed:', chainId);
  });
};

export const detectWalletProviders = () => {
  // Listen for wallet detection
  if (window.ethereum) {
    console.log('🦊 Ethereum provider detected:', {
      isMetaMask: window.ethereum.isMetaMask,
      isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
      providers: (window.ethereum.providers as any[])?.length || 'N/A'
    });
  }

  // Check for multiple wallet providers
  if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
    console.log('🔍 Multiple wallet providers detected:', 
      window.ethereum.providers.map((p: any) => ({
        isMetaMask: p.isMetaMask,
        isCoinbaseWallet: p.isCoinbaseWallet,
        isRabby: p.isRabby,
        isTrust: p.isTrust
      }))
    );
  }
};