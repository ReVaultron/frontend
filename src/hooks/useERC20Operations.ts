// hooks/useERC20Operations.ts
import { useState, useEffect } from "react";
import { useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { 
  useUserVaultWrite, 
  useUserVaultData 
} from "@/hooks/useContracts";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import type { Address } from "viem";

// ERC20 tokens typically use 18 decimals (but can vary)
const DEFAULT_ERC20_DECIMALS = 18;

/**
 * Hook to get ERC20 token information (decimals, symbol, balance)
 */
export function useERC20TokenInfo(tokenAddress?: Address, accountAddress?: Address) {
  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!tokenAddress },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: !!tokenAddress },
  });

  const { data: name } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "name",
    query: { enabled: !!tokenAddress },
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: accountAddress ? [accountAddress] : undefined,
    query: { enabled: !!(tokenAddress && accountAddress) },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: accountAddress ? [accountAddress, accountAddress] : undefined,
    query: { enabled: !!(tokenAddress && accountAddress) },
  });

  return {
    decimals: decimals ? Number(decimals) : DEFAULT_ERC20_DECIMALS,
    symbol: symbol as string | undefined,
    name: name as string | undefined,
    balance: balance || BigInt(0),
    allowance: allowance || BigInt(0),
    refetchBalance,
    refetchAllowance,
  };
}

/**
 * Hook to approve ERC20 token spending
 */
export function useERC20Approve(tokenAddress?: Address, spenderAddress?: Address) {
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (amount: bigint) => {
    if (!tokenAddress || !spenderAddress) {
      throw new Error("Token or spender address not provided");
    }

    setIsPending(true);
    setError(null);

    try {
      // This would typically use useWriteContract
      // For now, showing the structure
      console.log("Approving", amount, "of", tokenAddress, "for", spenderAddress);
      
      // Simulated approval - replace with actual implementation
      // const { writeContract } = useWriteContract();
      // await writeContract({
      //   address: tokenAddress,
      //   abi: erc20Abi,
      //   functionName: "approve",
      //   args: [spenderAddress, amount],
      // });
      
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to deposit ERC20 tokens into vault
 */
export function useERC20Deposit(vaultAddress?: Address, tokenAddress?: Address) {
  const {address} = useAccount();
  const { depositERC20, isPending, isSuccess, error, hash } = useUserVaultWrite(vaultAddress);
  const { decimals, balance, refetchBalance } = useERC20TokenInfo(tokenAddress, address);
  const { erc20BalanceRaw, refetchHbarBalance } = useUserVaultData(vaultAddress);
  console.log('error', error)
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const depositTokens = async (amount: string) => {
    if (!tokenAddress) {
      throw new Error("Token address not provided");
    }

    if (!vaultAddress) {
      throw new Error("Vault address not provided");
    }

    // Check if user has sufficient balance
    if (balance < BigInt(amount)) {
      throw new Error("Insufficient token balance");
    }

    await depositERC20(tokenAddress, BigInt(amount));
  };

  // Refetch balances after successful deposit
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        refetchBalance();
        refetchHbarBalance();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refetchBalance, refetchHbarBalance]);

  return {
    depositTokens,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    decimals,
    balance,
    refetchBalance,
  };
}

/**
 * Hook to withdraw ERC20 tokens from vault
 */
export function useERC20Withdraw(vaultAddress?: Address, tokenAddress?: Address) {
  const { withdrawERC20To, isPending, isSuccess, error, hash } = useUserVaultWrite(vaultAddress);
  const { erc20BalanceRaw, refetchHbarBalance } = useUserVaultData(vaultAddress);
  const { decimals, refetchBalance } = useERC20TokenInfo(tokenAddress, vaultAddress);
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const withdrawTokens = async (amount: string, recipient: Address) => {
    if (!tokenAddress) {
      throw new Error("Token address not provided");
    }

    if (!vaultAddress) {
      throw new Error("Vault address not provided");
    }

    // Convert to smallest unit based on token decimals
    const amountInSmallestUnit = parseUnits(amount, decimals);

    // Verify sufficient vault balance
    if (erc20BalanceRaw < amountInSmallestUnit) {
      throw new Error("Insufficient vault balance");
    }

    await withdrawERC20To(tokenAddress, amountInSmallestUnit, recipient);
  };

  // Refetch balances after successful withdrawal
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        refetchBalance();
        refetchHbarBalance();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refetchBalance, refetchHbarBalance]);

  return {
    withdrawTokens,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    decimals,
    vaultBalance: erc20BalanceRaw,
    refetchBalance,
  };
}

/**
 * Hook to get comprehensive ERC20 token data for a vault
 */
export function useVaultERC20Data(vaultAddress?: Address, tokenAddress?: Address) {
  const vaultData = useUserVaultData(vaultAddress);
  const tokenInfo = useERC20TokenInfo(tokenAddress, vaultAddress);

  return {
    ...vaultData,
    ...tokenInfo,
    vaultERC20Balance: vaultData.erc20BalanceRaw,
    vaultERC20BalanceFormatted: vaultData.erc20Balance,
  };
}