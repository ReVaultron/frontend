import { useState, useEffect, useCallback } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
} from "@reown/appkit/react";
import { useAppKitContext } from "../App";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface NetworkInfo {
  chainId: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

// Supported networks configuration
export const SUPPORTED_NETWORKS: Record<number, NetworkInfo> = {
  // Ethereum Mainnet
  1: {
    chainId: 1,
    name: "Ethereum Mainnet",
    shortName: "Ethereum",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  // Ethereum Sepolia
  11155111: {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    shortName: "Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  // Base Sepolia
  84532: {
    chainId: 84532,
    name: "Base Sepolia",
    shortName: "Base Sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia-explorer.base.org"],
  },
  // Polygon zkEVM Mainnet
  1101: {
    chainId: 1101,
    name: "Polygon zkEVM",
    shortName: "zkEVM",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://zkevm-rpc.com"],
    blockExplorerUrls: ["https://zkevm.polygonscan.com"],
  },
  // Hedera Mainnet
  295: {
    chainId: 295,
    name: "Hedera Mainnet",
    shortName: "Hedera",
    nativeCurrency: {
      name: "HBAR",
      symbol: "HBAR",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.hashio.io/api"],
    blockExplorerUrls: ["https://hashscan.io"],
  },
  // Hedera Testnet
  296: {
    chainId: 296,
    name: "Hedera Testnet",
    shortName: "Hedera Testnet",
    nativeCurrency: {
      name: "HBAR",
      symbol: "HBAR",
      decimals: 18,
    },
    rpcUrls: ["https://testnet.hashio.io/api"],
    blockExplorerUrls: ["https://hashscan.io/testnet"],
  },
  // Rootstock Mainnet
  30: {
    chainId: 30,
    name: "Rootstock Mainnet",
    shortName: "RSK",
    nativeCurrency: {
      name: "Smart Bitcoin",
      symbol: "RBTC",
      decimals: 18,
    },
    rpcUrls: ["https://public-node.rsk.co"],
    blockExplorerUrls: ["https://explorer.rsk.co"],
  },
  // Rootstock Testnet
  31: {
    chainId: 31,
    name: "Rootstock Testnet",
    shortName: "RSK Testnet",
    nativeCurrency: {
      name: "Smart Bitcoin Testnet",
      symbol: "tRBTC",
      decimals: 18,
    },
    rpcUrls: ["https://public-node.testnet.rsk.co"],
    blockExplorerUrls: ["https://explorer.testnet.rsk.co"],
  },
};

export const useWallet = () => {
  const { isInitialized, appKit, universalProvider } = useAppKitContext();
  const { open, close } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();

  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isLoading: false,
    error: null,
  });

  // Only update state if AppKit is initialized
  useEffect(() => {
    if (isInitialized) {
      setWalletState((prev) => ({
        ...prev,
        isConnected: isConnected || false,
        address: address || null,
        chainId: (chainId as number) || null,
      }));
    }
  }, [isInitialized, isConnected, address, chainId]);

  const connectWallet = useCallback(async () => {
    if (!isInitialized) {
      console.warn("AppKit not initialized yet");
      return;
    }

    try {
      setWalletState((prev) => ({ ...prev, isLoading: true, error: null }));
      console.log("🔌 Opening wallet connection modal...");
      open();
      // The actual connection result will be handled by the useEffect above
      setWalletState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setWalletState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to connect wallet",
        isLoading: false,
      }));
    }
  }, [open, isInitialized]);

  const disconnect = useCallback(async () => {
    if (!isInitialized) {
      console.warn("AppKit not initialized yet");
      return;
    }

    try {
      setWalletState((prev) => ({ ...prev, isLoading: true, error: null }));
      console.log("🔌 Disconnecting wallet...");

      // Use AppKit's disconnect functionality
      if (appKit?.disconnect) {
        await appKit.disconnect();
      }

      setWalletState({
        isConnected: false,
        address: null,
        chainId: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      setWalletState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to disconnect wallet",
        isLoading: false,
      }));
    }
  }, [appKit, isInitialized]);

  // Added switchToNetwork function

  const switchToNetwork = useCallback(
    async (targetChainId: number) => {
      if (!isInitialized || !isConnected) {
        console.warn("Wallet not connected or AppKit not initialized");
        return;
      }

      const networkInfo = SUPPORTED_NETWORKS[targetChainId];
      if (!networkInfo) {
        console.error("Unsupported network:", targetChainId);
        setWalletState((prev) => ({
          ...prev,
          error: `Unsupported network: ${targetChainId}`,
        }));
        return;
      }

      try {
        setWalletState((prev) => ({ ...prev, isLoading: true, error: null }));
        console.log(
          "🔄 Switching to network:",
          networkInfo.name,
          "Chain ID:",
          targetChainId
        );

        // Skip AppKit methods entirely - go straight to direct wallet interaction
        if (!window.ethereum) {
          throw new Error("No wallet provider found");
        }

        const hexChainId = `0x${targetChainId.toString(16)}`;
        console.log("🔢 Hex Chain ID:", hexChainId);

        try {
          console.log("🦊 Attempting direct wallet switch...");

          await (window.ethereum as any).request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: hexChainId }],
          });

          console.log("✅ Direct wallet switch successful");
          setWalletState((prev) => ({ ...prev, isLoading: false }));
          return;
        } catch (switchError: unknown) {
          console.log("⚠️ Direct switch failed with error:", switchError);

          // If the network doesn't exist, try to add it (error code 4902)
          if (
            typeof switchError === "object" &&
            switchError !== null &&
            "code" in switchError &&
            (switchError as { code: number }).code === 4902 ||
            (switchError as { code: number }).code === -32603
          ) {
            try {
              console.log("🔧 Adding network to wallet...");

              const networkParams = {
                chainId: hexChainId,
                chainName: networkInfo.name,
                nativeCurrency: networkInfo.nativeCurrency,
                rpcUrls: networkInfo.rpcUrls,
                blockExplorerUrls: networkInfo.blockExplorerUrls,
              };

              console.log("📋 Network params:", networkParams);

              await (window.ethereum as any).request({
                method: "wallet_addEthereumChain",
                params: [networkParams],
              });

              console.log("✅ Network added and switched successfully");
              setWalletState((prev) => ({ ...prev, isLoading: false }));
              return;
            } catch (addError: unknown) {
              console.error("❌ Failed to add network:", addError);

              let addErrorMessage = "Failed to add network";
              if (
                typeof addError === "object" &&
                addError !== null &&
                "code" in addError &&
                (addError as { code: number }).code === 4001
              ) {
                addErrorMessage = "Network addition was rejected by user";
              }

              setWalletState((prev) => ({
                ...prev,
                error: addErrorMessage,
                isLoading: false,
              }));
              return;
            }
          } else if (
            typeof switchError === "object" &&
            switchError !== null &&
            "code" in switchError &&
            (switchError as { code: number }).code === 4001
          ) {
            // User rejected the request
            setWalletState((prev) => ({
              ...prev,
              error: "Network switch was rejected by user",
              isLoading: false,
            }));
            return;
          } else if (
            typeof switchError === "object" &&
            switchError !== null &&
            "code" in switchError &&
            (switchError as { code: number }).code === -32002
          ) {
            // Request already pending
            setWalletState((prev) => ({
              ...prev,
              error: "Network switch request is already pending in your wallet",
              isLoading: false,
            }));
            return;
          } else {
            throw switchError;
          }
        }
      } catch (error: unknown) {
        console.error("❌ Network switch failed completely:", error);

        let errorMessage = "Failed to switch network";
        if (error && typeof error === "object" && "message" in error && typeof (error as { message?: string }).message === "string") {
          errorMessage = (error as { message: string }).message;
        }

        setWalletState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    },
    [isInitialized, isConnected]
  );

  const getShortAddress = useCallback(
    (addr?: string | null) => {
      const targetAddress = addr || walletState.address;
      if (!targetAddress) return "";
      return `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`;
    },
    [walletState.address]
  );

  const getNetworkName = useCallback(() => {
    if (!walletState.chainId) return "Unknown Network";
    const network = SUPPORTED_NETWORKS[walletState.chainId];
    return network ? network.shortName : `Chain ${walletState.chainId}`;
  }, [walletState.chainId]);

  const getNetworkInfo = useCallback(() => {
    if (!walletState.chainId) return null;
    return SUPPORTED_NETWORKS[walletState.chainId] || null;
  }, [walletState.chainId]);

  const getCurrentNetwork = useCallback(() => {
    return getNetworkInfo();
  }, [getNetworkInfo]);

  const isMainnet = walletState.chainId === 1 || walletState.chainId === 295 || walletState.chainId === 30;
  const isTestnet = [11155111, 84532, 296, 31].includes(walletState.chainId || 0);

  const supportedNetworks = SUPPORTED_NETWORKS;

  // Log final wallet state
  useEffect(() => {
    console.log("🎯 Final wallet state:", {
      isConnected: walletState.isConnected,
      address: walletState.address,
      shortAddress: walletState.address ? getShortAddress() : null,
      chainId: walletState.chainId,
      networkName: walletState.chainId ? getNetworkName() : null,
      isMainnet,
      isTestnet,
      isLoading: walletState.isLoading,
      error: walletState.error,
    });
  }, [walletState, getShortAddress, getNetworkName, isMainnet, isTestnet]);

  return {
    ...walletState,
    connectWallet,
    disconnect,
    switchToNetwork,
    getShortAddress,
    getNetworkName,
    getNetworkInfo,
    getCurrentNetwork,
    supportedNetworks: SUPPORTED_NETWORKS,
    isMainnet,
    isTestnet,
    openModal: connectWallet,
  };
};
