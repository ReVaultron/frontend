// lib/pyth/price-feeds.ts
/**
 * Pyth Price Feed IDs for various assets
 * Full list: https://pyth.network/developers/price-feed-ids
 */

export const PYTH_PRICE_FEEDS = {
  // Major Cryptocurrencies
  HBAR_USD: '3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd',
  BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  
  // Stablecoins
  USDC_USD: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  USDT_USD: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
  DAI_USD: '0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd',
  
  // DeFi Tokens
  UNI_USD: '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
  LINK_USD: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
  AAVE_USD: '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
} as const;

export type PythPriceFeedId = typeof PYTH_PRICE_FEEDS[keyof typeof PYTH_PRICE_FEEDS];

export interface TokenPriceFeed {
  id: PythPriceFeedId;
  symbol: string;
  name: string;
  description: string;
}

export const TOKEN_PRICE_FEEDS: Record<string, TokenPriceFeed> = {
  HBAR: {
    id: PYTH_PRICE_FEEDS.HBAR_USD,
    symbol: 'HBAR',
    name: 'Hedera',
    description: 'HBAR/USD Price Feed',
  },
  BTC: {
    id: PYTH_PRICE_FEEDS.BTC_USD,
    symbol: 'BTC',
    name: 'Bitcoin',
    description: 'BTC/USD Price Feed',
  },
  ETH: {
    id: PYTH_PRICE_FEEDS.ETH_USD,
    symbol: 'ETH',
    name: 'Ethereum',
    description: 'ETH/USD Price Feed',
  },
  USDC: {
    id: PYTH_PRICE_FEEDS.USDC_USD,
    symbol: 'USDC',
    name: 'USD Coin',
    description: 'USDC/USD Price Feed',
  },
};
