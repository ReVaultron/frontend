
// components/prices/PriceDisplay.tsx
import { usePythPrice } from '@/hooks/usePythPrices';
import { TOKEN_PRICE_FEEDS } from '@/lib/pyth/price-feeds';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PriceDisplayProps {
  tokenSymbol: keyof typeof TOKEN_PRICE_FEEDS;
  showChange?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ 
  tokenSymbol, 
  showChange = true,
  size = 'md' 
}: PriceDisplayProps) {
  const feed = TOKEN_PRICE_FEEDS[tokenSymbol];
  const { price, isLoading, error, refetch, lastUpdate } = usePythPrice({
    priceFeedId: feed.id,
    refreshInterval: 10000, // 10 seconds
  });

  if (isLoading) {
    return <Skeleton className="h-8 w-32" />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Price unavailable</span>
        <Button variant="ghost" size="sm" onClick={refetch}>
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  if (!price) {
    return <span className="text-muted-foreground">No price data</span>;
  }

  const fontSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base';

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-bold ${fontSize}`}>
            ${price.priceUSD.toFixed(4)}
          </span>
          {showChange && (
            <span className="text-xs text-muted-foreground">
              ±${price.confidenceUSD.toFixed(4)}
            </span>
          )}
        </div>
        {lastUpdate && (
          <span className="text-xs text-muted-foreground">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={refetch}>
        <RefreshCw className="w-3 h-3" />
      </Button>
    </div>
  );
}

// utils/price-calculations.ts
import type { ParsedPythPrice } from '@/lib/pyth/hermes-client';

/**
 * Calculate USD value of a token amount
 */
export function calculateUSDValue(
  tokenAmount: number,
  price: ParsedPythPrice
): number {
  return tokenAmount * price.priceUSD;
}

/**
 * Calculate token amount from USD value
 */
export function calculateTokenAmount(
  usdValue: number,
  price: ParsedPythPrice
): number {
  return usdValue / price.priceUSD;
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number, decimals: number = 4): string {
  if (price >= 1000) {
    return price.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  }
  if (price >= 1) {
    return price.toFixed(decimals);
  }
  // For prices < 1, show more decimals
  return price.toFixed(Math.max(decimals, 6));
}

/**
 * Calculate price change percentage
 */
export function calculatePriceChange(
  currentPrice: number,
  previousPrice: number
): number {
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/**
 * Get price freshness status
 */
export function isPriceStale(
  publishTime: number,
  maxAge: number = 60 // seconds
): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now - publishTime > maxAge;
}