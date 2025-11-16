// lib/pyth/hermes-client.ts
/**
 * Pyth Hermes REST API Client
 * Fetches real-time price data from Pyth Network
 * Documentation: https://hermes.pyth.network/docs
 */

export interface PythPrice {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
}

export interface ParsedPythPrice {
  id: string;
  price: number;
  confidence: number;
  expo: number;
  publishTime: number;
  priceUSD: number; // Human-readable price in USD
  confidenceUSD: number; // Human-readable confidence in USD
}

export class HermesClient {
  private baseUrl: string;

  constructor(network: 'mainnet' | 'testnet' = 'mainnet') {
    // Pyth Hermes API endpoints
    this.baseUrl = network === 'mainnet' 
      ? 'https://hermes.pyth.network'
      : 'https://hermes-beta.pyth.network';
  }

  /**
   * Fetch latest price for a single price feed
   */
  async getLatestPrice(priceFeedId: string): Promise<ParsedPythPrice> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/updates/price/latest?ids[]=${priceFeedId}`
      );

      if (!response.ok) {
        throw new Error(`Hermes API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.parsed || data.parsed.length === 0) {
        throw new Error('No price data returned');
      }

      return this.parsePriceData(data.parsed[0]);
    } catch (error) {
      console.error('Error fetching Pyth price:', error);
      throw error;
    }
  }

  /**
   * Fetch latest prices for multiple price feeds
   */
  async getLatestPrices(priceFeedIds: string[]): Promise<ParsedPythPrice[]> {
    try {
      const idsParam = priceFeedIds.map(id => `ids[]=${id}`).join('&');
      const response = await fetch(
        `${this.baseUrl}/v2/updates/price/latest?${idsParam}`
      );

      if (!response.ok) {
        throw new Error(`Hermes API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.parsed || data.parsed.length === 0) {
        throw new Error('No price data returned');
      }

      return data.parsed.map((price: PythPrice) => this.parsePriceData(price));
    } catch (error) {
      console.error('Error fetching Pyth prices:', error);
      throw error;
    }
  }

  /**
   * Parse raw Pyth price data into readable format
   */
  private parsePriceData(pythPrice: PythPrice): ParsedPythPrice {
    const price = parseFloat(pythPrice.price.price);
    const conf = parseFloat(pythPrice.price.conf);
    const expo = pythPrice.price.expo;
    
    // Convert to human-readable format
    const priceUSD = price * Math.pow(10, expo);
    const confidenceUSD = conf * Math.pow(10, expo);

    return {
      id: pythPrice.id,
      price,
      confidence: conf,
      expo,
      publishTime: pythPrice.price.publish_time,
      priceUSD,
      confidenceUSD,
    };
  }

  /**
   * Get price update data for on-chain submission
   */
  async getPriceUpdateData(priceFeedIds: string[]): Promise<string[]> {
    try {
      const idsParam = priceFeedIds.map(id => `ids[]=${id}`).join('&');
      const response = await fetch(
        `${this.baseUrl}/v2/updates/price/latest?${idsParam}&encoding=hex`
      );

      if (!response.ok) {
        throw new Error(`Hermes API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.binary.data;
    } catch (error) {
      console.error('Error fetching price update data:', error);
      throw error;
    }
  }
}

// Singleton instance
let hermesClient: HermesClient | null = null;

export function getHermesClient(network: 'mainnet' | 'testnet' = 'mainnet'): HermesClient {
  if (!hermesClient) {
    hermesClient = new HermesClient(network);
  }
  return hermesClient;
}

