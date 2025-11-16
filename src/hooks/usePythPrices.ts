// hooks/usePythPrices.ts
import { useState, useEffect, useCallback } from 'react';
import { getHermesClient } from '@/lib/pyth/hermes-client';
import type { ParsedPythPrice } from '@/lib/pyth/hermes-client';

interface UsePythPriceOptions {
  priceFeedId: string;
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface UsePythPriceResult {
  price: ParsedPythPrice | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdate: Date | null;
}

export function usePythPrice({
  priceFeedId,
  refreshInterval = 60000, // Default: 60 seconds
  enabled = true,
}: UsePythPriceOptions): UsePythPriceResult {
  const [price, setPrice] = useState<ParsedPythPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const client = getHermesClient('mainnet');
      const priceData = await client.getLatestPrice(priceFeedId);

      setPrice(priceData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching Pyth price:', err);
    } finally {
      setIsLoading(false);
    }
  }, [priceFeedId, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Auto-refresh
  useEffect(() => {
    if (!enabled || !refreshInterval) return;

    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrice, refreshInterval, enabled]);

  return {
    price,
    isLoading,
    error,
    refetch: fetchPrice,
    lastUpdate,
  };
}

// Hook for multiple prices
interface UsePythPricesOptions {
  priceFeedIds: string[];
  refreshInterval?: number;
  enabled?: boolean;
}

interface UsePythPricesResult {
  prices: Record<string, ParsedPythPrice>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdate: Date | null;
}

export function usePythPrices({
  priceFeedIds,
  refreshInterval = 10000,
  enabled = true,
}: UsePythPricesOptions): UsePythPricesResult {
  const [prices, setPrices] = useState<Record<string, ParsedPythPrice>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!enabled || priceFeedIds.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const client = getHermesClient('mainnet');
      const priceData = await client.getLatestPrices(priceFeedIds);

      const pricesMap = priceData.reduce((acc, price) => {
        acc[price.id] = price;
        return acc;
      }, {} as Record<string, ParsedPythPrice>);

      setPrices(pricesMap);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching Pyth prices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [priceFeedIds, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Auto-refresh
  useEffect(() => {
    if (!enabled || !refreshInterval) return;

    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval, enabled]);

  return {
    prices,
    isLoading,
    error,
    refetch: fetchPrices,
    lastUpdate,
  };
}
