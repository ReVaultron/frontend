// Create a tokens config file
// lib/wallet/tokenConfig.ts

import { Address } from "viem";
import { useReadContract } from "wagmi";

export const HEDERA_TOKENS = {
  testnet: [
    {
      address: "0x0000000000000000000000000000000000342855",
      name: "HBAR",
      symbol: "HBAR",
      decimals: 8,
      logo: "/tokens/hbar.svg",
      // Hedera Token ID
      tokenId: "0.0.359"
    },
    {
      address: "0x0000000000000000000000000000000000068cda",
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
      logo: "/tokens/usdc.svg",
      tokenId: "0.0.429274"
    }
  ],
  mainnet: [
    // Mainnet tokens
  ]
};

// Hook to fetch token balances
export function useTokenBalance(address: Address, token: Address) {
  // Query HTS balance
  const { data } = useReadContract({
    address: HTS_PRECOMPILE,
    abi: HTS_ABI,
    functionName: 'balanceOf',
    args: [token, address]
  });
  
  return data;
}