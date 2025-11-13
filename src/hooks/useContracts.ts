// hooks/useContracts.ts
import { useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import { USER_VAULT_ABI, VOLATILITY_INDEX_ABI, CONTRACT_ADDRESSES, DEFAULT_PRICE_FEED_ID } from "@/lib/contracts/abis";
import { useState, useEffect } from "react";

// ==================== USER VAULT HOOKS ====================

export function useUserVaultData(vaultAddress?: `0x${string}`) {
  const address = vaultAddress || CONTRACT_ADDRESSES.USER_VAULT;

  // Read owner
  const { data: owner } = useReadContract({
    address,
    abi: USER_VAULT_ABI,
    functionName: "owner",
  });

  // Read all supported tokens
  const { data: tokens } = useReadContract({
    address,
    abi: USER_VAULT_ABI,
    functionName: "getAllSupportedTokens",
  });

  // Read token count
  const { data: tokenCount } = useReadContract({
    address,
    abi: USER_VAULT_ABI,
    functionName: "getSupportedTokenCount",
  });

  // Read HBAR balance
  const { data: hbarBalance } = useReadContract({
    address,
    abi: USER_VAULT_ABI,
    functionName: "getHBARBalance",
  });

  // Get balance for first token (if exists)
  const { data: firstTokenBalance } = useReadContract({
    address,
    abi: USER_VAULT_ABI,
    functionName: "getBalance",
    args: tokens && tokens.length > 0 ? [tokens[0]] : undefined,
  });

  // Calculate total value (simplified - would need price feeds in production)
  const totalValue = hbarBalance ? Number(hbarBalance) / 1e18 : 0;

  return {
    owner,
    tokens: tokens || [],
    tokenCount: tokenCount ? Number(tokenCount) : 0,
    hbarBalance: hbarBalance ? (Number(hbarBalance) / 1e18).toFixed(4) : "0",
    totalValue: totalValue.toFixed(2),
    address,
  };
}

export function useUserVaultWrite(vaultAddress?: `0x${string}`) {
  const address = vaultAddress || CONTRACT_ADDRESSES.USER_VAULT;
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const deposit = async (token: `0x${string}`, amount: bigint) => {
    return writeContract({
      address,
      abi: USER_VAULT_ABI,
      functionName: "deposit",
      args: [token, amount],
    });
  };

  const withdrawTo = async (token: `0x${string}`, amount: bigint, to: `0x${string}`) => {
    return writeContract({
      address,
      abi: USER_VAULT_ABI,
      functionName: "withdrawTo",
      args: [token, amount, to],
    });
  };

  const associateToken = async (token: `0x${string}`) => {
    return writeContract({
      address,
      abi: USER_VAULT_ABI,
      functionName: "associateToken",
      args: [token],
    });
  };

  const associateTokens = async (tokens: `0x${string}`[]) => {
    return writeContract({
      address,
      abi: USER_VAULT_ABI,
      functionName: "associateTokens",
      args: [tokens],
    });
  };

  const syncTokenBalance = async (token: `0x${string}`) => {
    return writeContract({
      address,
      abi: USER_VAULT_ABI,
      functionName: "syncTokenBalance",
      args: [token],
    });
  };

  const syncAllTokens = async () => {
    return writeContract({
      address,
      abi: USER_VAULT_ABI,
      functionName: "syncAllTokens",
    });
  };

  return {
    deposit,
    withdrawTo,
    associateToken,
    associateTokens,
    syncTokenBalance,
    syncAllTokens,
    isPending,
    isSuccess,
    error,
    hash,
  };
}

export function useUserVaultEvents(vaultAddress?: `0x${string}`) {
  const address = vaultAddress || CONTRACT_ADDRESSES.USER_VAULT;
  const [tokenReceived, setTokenReceived] = useState<any[]>([]);
  const [tokenWithdrawn, setTokenWithdrawn] = useState<any[]>([]);
  const [tokenAssociated, setTokenAssociated] = useState<any[]>([]);

  // Watch TokensReceived events
  useWatchContractEvent({
    address,
    abi: USER_VAULT_ABI,
    eventName: "TokensReceived",
    onLogs: (logs) => {
      setTokenReceived((prev) => [...prev, ...logs]);
    },
  });

  // Watch TokensWithdrawn events
  useWatchContractEvent({
    address,
    abi: USER_VAULT_ABI,
    eventName: "TokensWithdrawn",
    onLogs: (logs) => {
      setTokenWithdrawn((prev) => [...prev, ...logs]);
    },
  });

  // Watch TokenAssociated events
  useWatchContractEvent({
    address,
    abi: USER_VAULT_ABI,
    eventName: "TokenAssociated",
    onLogs: (logs) => {
      setTokenAssociated((prev) => [...prev, ...logs]);
    },
  });

  return {
    tokenReceived,
    tokenWithdrawn,
    tokenAssociated,
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
  const { data: volatilityData } = useReadContract({
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
  const parsedData = volatilityData ? {
    volatilityBps: Number(volatilityData[0]),
    price: Number(volatilityData[1]),
    confidence: Number(volatilityData[2]),
    expo: Number(volatilityData[3]),
    timestamp: Number(volatilityData[4]),
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
    supportedFeeds: supportedFeeds || [],
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
  vaultAddress?: `0x${string}`,
  priceFeedId: `0x${string}` = DEFAULT_PRICE_FEED_ID,
  userThreshold: number = 30 // default 30%
) {
  const vaultData = useUserVaultData(vaultAddress);
  const volatilityData = useVolatilityIndexData(priceFeedId);

  const isVolatilityAboveThreshold = volatilityData.currentVolatility > userThreshold;

  const riskLevel = (() => {
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
export function useTokenAssociation(vaultAddress?: `0x${string}`, token?: `0x${string}`) {
  const address = vaultAddress || CONTRACT_ADDRESSES.USER_VAULT;

  const { data: isAssociated } = useReadContract({
    address,
    abi: USER_VAULT_ABI,
    functionName: "isTokenAssociated",
    args: token ? [token] : undefined,
  });

  return {
    isAssociated: isAssociated || false,
  };
}