// hooks/useContracts.ts
import { useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import { 
  USER_VAULT_ABI, 
  VOLATILITY_INDEX_ABI, 
  CONTRACT_ADDRESSES, 
  DEFAULT_PRICE_FEED_ID,
  FACTORY_VAULT_ABI
} from "@/lib/contracts/abis";
import { useState } from "react";
import type { Address } from "viem";


// ==================== TYPE DEFINITIONS ====================

export interface VolatilityData {
  volatilityBps: number;
  price: number;
  confidence: number;
  expo: number;
  timestamp: number;
}

export type RiskLevel = "low" | "moderate" | "elevated" | "high";

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert BigInt amount to int64 for HTS operations
 * HTS uses int64 (max value: 9,223,372,036,854,775,807)
 */
function toInt64(amount: bigint): bigint {
  const MAX_INT64 = BigInt("9223372036854775807");
  if (amount > MAX_INT64) {
    throw new Error(`Amount ${amount} exceeds int64 max value`);
  }
  return amount;
}

/**
 * Convert number to int64 BigInt
 */
function numberToInt64(amount: number): bigint {
  return toInt64(BigInt(Math.floor(amount)));
}

// ==================== FACTORY VAULT HOOKS ====================

export function useFactoryVaultData() {
  const address = CONTRACT_ADDRESSES.FACTORY_VAULT;

  // Read creation fee
  const { data: creationFee, refetch: refetchFee } = useReadContract({
    address,
    abi: FACTORY_VAULT_ABI,
    functionName: "getCreationFee",
  });

  // Read vault count
  const { data: vaultCount, refetch: refetchCount } = useReadContract({
    address,
    abi: FACTORY_VAULT_ABI,
    functionName: "getVaultCount",
  });

  // Read factory balance
  const { data: balance } = useReadContract({
    address,
    abi: FACTORY_VAULT_ABI,
    functionName: "getBalance",
  });

  return {
    creationFee: creationFee ? Number(creationFee) / 1e18 : 0,
    creationFeeRaw: creationFee || BigInt(0),
    vaultCount: vaultCount ? Number(vaultCount) : 0,
    balance: balance ? Number(balance) / 1e18 : 0,
    balanceRaw: balance || BigInt(0),
    refetchFee,
    refetchCount,
  };
}

export function useFactoryVaultWrite() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const createVault = async (value: bigint) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.FACTORY_VAULT,
      abi: FACTORY_VAULT_ABI,
      functionName: "createVault",
      value,
    });
  };

  return {
    createVault,
    isPending,
    isSuccess,
    error,
    hash,
  };
}

export function useUserVaultAddress(userAddress?: Address) {
  const { data: vaultAddress } = useReadContract({
    address: CONTRACT_ADDRESSES.FACTORY_VAULT,
    abi: FACTORY_VAULT_ABI,
    functionName: "getVault",
    args: userAddress ? [userAddress] : undefined,
  });

  const { data: hasVault } = useReadContract({
    address: CONTRACT_ADDRESSES.FACTORY_VAULT,
    abi: FACTORY_VAULT_ABI,
    functionName: "hasVault",
    args: userAddress ? [userAddress] : undefined,
  });

  return {
    vaultAddress: vaultAddress as Address | undefined,
    hasVault: hasVault || false,
  };
}

// ==================== USER VAULT HOOKS ====================

export function useUserVaultData(vaultAddress?: Address) {
  // Read owner
  const { data: owner } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "owner",
    query: { enabled: !!vaultAddress },
  });

  // Read all supported tokens
  const { data: tokens, refetch: refetchTokens } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "getAllSupportedTokens",
    query: { enabled: !!vaultAddress },
  });

  // Read token count
  const { data: tokenCount } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "getSupportedTokenCount",
    query: { enabled: !!vaultAddress },
  });

  // Read HBAR balance
  const { data: hbarBalance, refetch: refetchHbarBalance } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "getHBARBalance",
    query: { enabled: !!vaultAddress },
  });

  return {
    owner: owner as Address | undefined,
    tokens: (tokens as Address[]) || [],
    tokenCount: tokenCount ? Number(tokenCount) : 0,
    hbarBalance: hbarBalance ? (Number(hbarBalance) / 1e18).toFixed(4) : "0",
    hbarBalanceRaw: hbarBalance || BigInt(0),
    address: vaultAddress,
    refetchTokens,
    refetchHbarBalance,
  };
}

export function useTokenBalance(vaultAddress?: Address, tokenAddress?: Address) {
  // Get tracked balance (internal accounting)
  const { data: trackedBalance, refetch: refetchTracked } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "getTrackedBalance",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!(vaultAddress && tokenAddress) },
  });

  // Get actual balance (from HTS)
  const { data: actualBalance, refetch: refetchActual } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "getBalance",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!(vaultAddress && tokenAddress) },
  });

  // Check if needs sync
  const { data: needsSync } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "needsSync",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!(vaultAddress && tokenAddress) },
  });

  // Get last sync timestamp
  const { data: lastSyncTimestamp } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "getLastSyncTimestamp",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!(vaultAddress && tokenAddress) },
  });

  return {
    trackedBalance: trackedBalance ? Number(trackedBalance) : 0,
    actualBalance: actualBalance ? Number(actualBalance) : 0,
    trackedBalanceRaw: trackedBalance || BigInt(0),
    actualBalanceRaw: actualBalance || BigInt(0),
    needsSync: needsSync || false,
    lastSyncTimestamp: lastSyncTimestamp ? Number(lastSyncTimestamp) : 0,
    refetchTracked,
    refetchActual,
  };
}

export function useUserVaultWrite(vaultAddress?: Address) {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  /**
   * Deposit tokens into the vault
   * @param token Token address
   * @param amount Amount in token's smallest unit (as int64)
   */
  const deposit = async (token: Address, amount: bigint) => {
    if (!vaultAddress) throw new Error("Vault address not provided");
    
    const int64Amount = toInt64(amount);
    
    return writeContract({
      address: vaultAddress,
      abi: USER_VAULT_ABI,
      functionName: "deposit",
      args: [token, int64Amount],
    });
  };

  /**
   * Withdraw tokens from the vault
   * @param token Token address
   * @param amount Amount in token's smallest unit (as int64)
   * @param to Recipient address
   */
  const withdrawTo = async (token: Address, amount: bigint, to: Address) => {
    if (!vaultAddress) throw new Error("Vault address not provided");
    
    const int64Amount = toInt64(amount);
    
    return writeContract({
      address: vaultAddress,
      abi: USER_VAULT_ABI,
      functionName: "withdrawTo",
      args: [token, int64Amount, to],
    });
  };

  /**
   * Associate a single token with the vault
   */
  const associateToken = async (token: Address) => {
    if (!vaultAddress) throw new Error("Vault address not provided");
    
    return writeContract({
      address: vaultAddress,
      abi: USER_VAULT_ABI,
      functionName: "associateToken",
      args: [token],
    });
  };

  /**
   * Associate multiple tokens with the vault
   */
  const associateTokens = async (tokens: Address[]) => {
    if (!vaultAddress) throw new Error("Vault address not provided");
    
    return writeContract({
      address: vaultAddress,
      abi: USER_VAULT_ABI,
      functionName: "associateTokens",
      args: [tokens],
    });
  };

  /**
   * Sync a single token balance
   */
  const syncTokenBalance = async (token: Address) => {
    if (!vaultAddress) throw new Error("Vault address not provided");
    
    return writeContract({
      address: vaultAddress,
      abi: USER_VAULT_ABI,
      functionName: "syncTokenBalance",
      args: [token],
    });
  };

  /**
   * Sync all token balances
   */
  const syncAllTokens = async () => {
    if (!vaultAddress) throw new Error("Vault address not provided");
    
    return writeContract({
      address: vaultAddress,
      abi: USER_VAULT_ABI,
      functionName: "syncAllTokens",
    });
  };

  /**
   * Withdraw HBAR from the vault
   */
  const withdrawHBAR = async (amount: bigint, to: Address) => {
    if (!vaultAddress) throw new Error("Vault address not provided");
    
    return writeContract({
      address: vaultAddress,
      abi: USER_VAULT_ABI,
      functionName: "withdrawHBAR",
      args: [amount, to],
    });
  };

  /**
   * Dissociate a token from the vault (balance must be 0)
   */
  const dissociateToken = async (token: Address) => {
    if (!vaultAddress) throw new Error("Vault address not provided");
    
    return writeContract({
      address: vaultAddress,
      abi: USER_VAULT_ABI,
      functionName: "dissociateToken",
      args: [token],
    });
  };

  return {
    deposit,
    withdrawTo,
    associateToken,
    associateTokens,
    syncTokenBalance,
    syncAllTokens,
    withdrawHBAR,
    dissociateToken,
    isPending,
    isSuccess,
    error,
    hash,
  };
}

export function useUserVaultEvents(vaultAddress?: Address) {
  const [tokenReceived, setTokenReceived] = useState<any[]>([]);
  const [tokenWithdrawn, setTokenWithdrawn] = useState<any[]>([]);
  const [tokenAssociated, setTokenAssociated] = useState<any[]>([]);
  const [balanceSynced, setBalanceSynced] = useState<any[]>([]);

  // Watch TokensReceived events
  useWatchContractEvent({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    eventName: "TokensReceived",
    enabled: !!vaultAddress,
    onLogs: (logs) => {
      setTokenReceived((prev) => [...prev, ...logs]);
    },
  });

  // Watch TokensWithdrawn events
  useWatchContractEvent({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    eventName: "TokensWithdrawn",
    enabled: !!vaultAddress,
    onLogs: (logs) => {
      setTokenWithdrawn((prev) => [...prev, ...logs]);
    },
  });

  // Watch TokenAssociated events
  useWatchContractEvent({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    eventName: "TokenAssociated",
    enabled: !!vaultAddress,
    onLogs: (logs) => {
      setTokenAssociated((prev) => [...prev, ...logs]);
    },
  });

  // Watch BalanceSynced events
  useWatchContractEvent({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    eventName: "BalanceSynced",
    enabled: !!vaultAddress,
    onLogs: (logs) => {
      setBalanceSynced((prev) => [...prev, ...logs]);
    },
  });

  return {
    tokenReceived,
    tokenWithdrawn,
    tokenAssociated,
    balanceSynced,
  };
}

// ==================== VOLATILITY INDEX HOOKS ====================

export function useVolatilityIndexData(priceFeedId: `0x${string}` = DEFAULT_PRICE_FEED_ID) {
  // Read volatility for the price feed
  const { data: volatilityBps, refetch: refetchVolatility } = useReadContract({
    address: CONTRACT_ADDRESSES.VOLATILITY_INDEX,
    abi: VOLATILITY_INDEX_ABI,
    functionName: "getVolatility",
    args: [priceFeedId],
  });

  // Read volatility data (includes timestamp, price, etc.)
  const { data: volatilityDataRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.VOLATILITY_INDEX,
    abi: VOLATILITY_INDEX_ABI,
    functionName: "getVolatilityData",
    args: [priceFeedId],
  });

  // Read last update timestamp
  const { data: lastUpdate } = useReadContract({
    address: CONTRACT_ADDRESSES.VOLATILITY_INDEX,
    abi: VOLATILITY_INDEX_ABI,
    functionName: "getLastUpdate",
    args: [priceFeedId],
  });

  // Read max price staleness
  const { data: maxStaleness } = useReadContract({
    address: CONTRACT_ADDRESSES.VOLATILITY_INDEX,
    abi: VOLATILITY_INDEX_ABI,
    functionName: "maxPriceStaleness",
  });

  // Check if volatility is stale
  const { data: isStale } = useReadContract({
    address: CONTRACT_ADDRESSES.VOLATILITY_INDEX,
    abi: VOLATILITY_INDEX_ABI,
    functionName: "isVolatilityStale",
    args: [priceFeedId, maxStaleness || BigInt(3600)],
  });

  // Get supported feeds
  const { data: supportedFeeds } = useReadContract({
    address: CONTRACT_ADDRESSES.VOLATILITY_INDEX,
    abi: VOLATILITY_INDEX_ABI,
    functionName: "getSupportedFeeds",
  });

  // Parse volatility data
  const parsedData: VolatilityData | null = volatilityDataRaw ? {
    volatilityBps: Number(volatilityDataRaw.volatilityBps),
    price: Number(volatilityDataRaw.price),
    confidence: Number(volatilityDataRaw.confidence),
    expo: Number(volatilityDataRaw.expo),
    timestamp: Number(volatilityDataRaw.timestamp),
  } : null;

  const currentVolatility = volatilityBps ? Number(volatilityBps) / 100 : 0;
  const updateInterval = maxStaleness ? Number(maxStaleness) : 3600;

  return {
    currentVolatility,
    volatilityBps: volatilityBps ? Number(volatilityBps) : 0,
    lastUpdate: lastUpdate ? Number(lastUpdate) : 0,
    updateInterval,
    isStale: isStale || false,
    volatilityData: parsedData,
    supportedFeeds: (supportedFeeds as `0x${string}`[]) || [],
    refetchVolatility,
  };
}

export function useVolatilityIndexWrite() {
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const updateVolatility = async (
    priceUpdate: `0x${string}`[],
    priceFeedId: `0x${string}`,
    volatilityBps: bigint,
    value?: bigint
  ) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.VOLATILITY_INDEX,
      abi: VOLATILITY_INDEX_ABI,
      functionName: "updateVolatility",
      args: [priceUpdate, priceFeedId, volatilityBps],
      value: value || BigInt(0),
    });
  };

  const updateVolatilityBatch = async (
    priceUpdate: `0x${string}`[],
    priceFeedIds: `0x${string}`[],
    volatilitiesBps: bigint[],
    value?: bigint
  ) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.VOLATILITY_INDEX,
      abi: VOLATILITY_INDEX_ABI,
      functionName: "updateVolatilityBatch",
      args: [priceUpdate, priceFeedIds, volatilitiesBps],
      value: value || BigInt(0),
    });
  };

  return {
    updateVolatility,
    updateVolatilityBatch,
    isPending,
    isSuccess,
    error,
    hash,
  };
}

export function useVolatilityIndexEvents(priceFeedId?: `0x${string}`) {
  const [updates, setUpdates] = useState<any[]>([]);

  // Watch VolatilityUpdated events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.VOLATILITY_INDEX,
    abi: VOLATILITY_INDEX_ABI,
    eventName: "VolatilityUpdated",
    onLogs: (logs) => {
      // Filter by price feed ID if provided
      const filteredLogs = priceFeedId
        ? logs.filter((log: any) => log.args?.priceFeedId === priceFeedId)
        : logs;
      setUpdates((prev) => [...prev, ...filteredLogs]);
    },
  });

  return {
    updates,
  };
}

// ==================== COMBINED HOOKS ====================

export function useVaultWithVolatility(
  vaultAddress?: Address,
  priceFeedId: `0x${string}` = DEFAULT_PRICE_FEED_ID,
  userThreshold: number = 30 // default 30%
) {
  const vaultData = useUserVaultData(vaultAddress);
  const volatilityData = useVolatilityIndexData(priceFeedId);

  const isVolatilityAboveThreshold = volatilityData.currentVolatility > userThreshold;

  const riskLevel: RiskLevel = (() => {
    const ratio = volatilityData.currentVolatility / userThreshold;
    if (ratio < 0.5) return "low";
    if (ratio < 0.8) return "moderate";
    if (ratio < 1.0) return "elevated";
    return "high";
  })();

  return {
    ...vaultData,
    ...volatilityData,
    volatilityThreshold: userThreshold,
    isVolatilityAboveThreshold,
    shouldRebalance: isVolatilityAboveThreshold,
    riskLevel,
  };
}

// Helper hook to check token association
export function useTokenAssociation(vaultAddress?: Address, token?: Address) {
  const { data: isAssociated } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "checkTokenAssociation",
    args: token ? [token] : undefined,
    query: { enabled: !!(vaultAddress && token) },
  });

  const { data: isAccountAssociated } = useReadContract({
    address: vaultAddress,
    abi: USER_VAULT_ABI,
    functionName: "isAccountAssociatedWithToken",
    args: vaultAddress && token ? [vaultAddress, token] : undefined,
    query: { enabled: !!(vaultAddress && token) },
  });

  return {
    isVaultAssociated: isAssociated || false,
    isAccountAssociated: isAccountAssociated || false,
  };
}

// ==================== UTILITY EXPORTS ====================

export { toInt64, numberToInt64 };