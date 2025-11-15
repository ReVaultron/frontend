// hooks/useHTSTokenOperations.ts
import { useState, useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { 
  useUserVaultWrite, 
  useTokenBalance, 
  useTokenAssociation,
  toInt64 
} from "@/hooks/useContracts";
import { parseUnits } from "viem";
import type { Address } from "viem";

// HTS tokens typically use 8 decimals
const HTS_DECIMALS = 8;

export function useTokenAssociationOperations(vaultAddress?: Address, tokenAddress?: Address) {
  const { isVaultAssociated, isAccountAssociated } = useTokenAssociation(vaultAddress, tokenAddress);
  const { associateToken, isPending, isSuccess, error, hash } = useUserVaultWrite(vaultAddress);
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const associate = async () => {
    if (!tokenAddress) {
      throw new Error("Token address not provided");
    }

    await associateToken(tokenAddress);
  };

  return {
    associate,
    isVaultAssociated,
    isAccountAssociated,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useHTSDeposit(vaultAddress?: Address, tokenAddress?: Address) {
  const { deposit, isPending, isSuccess, error, hash } = useUserVaultWrite(vaultAddress);
  const { isVaultAssociated } = useTokenAssociation(vaultAddress, tokenAddress);
  const { refetchTracked, refetchActual } = useTokenBalance(vaultAddress, tokenAddress);
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const depositTokens = async (amount: string) => {
    if (!tokenAddress) {
      throw new Error("Token address not provided");
    }

    if (!isVaultAssociated) {
      throw new Error("Token not associated with vault");
    }

    // Convert to smallest unit with 8 decimals
    const amountInSmallestUnit = parseUnits(amount, HTS_DECIMALS);
    const int64Amount = toInt64(amountInSmallestUnit);

    await deposit(tokenAddress, int64Amount);
  };

  return {
    depositTokens,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    refetchBalance: () => {
      refetchTracked();
      refetchActual();
    },
  };
}

export function useHTSWithdraw(vaultAddress?: Address, tokenAddress?: Address) {
  const { withdrawTo, syncTokenBalance, isPending, isSuccess, error, hash } = useUserVaultWrite(vaultAddress);
  const { actualBalance, needsSync, refetchTracked, refetchActual } = useTokenBalance(vaultAddress, tokenAddress);
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });
  const [isSyncing, setIsSyncing] = useState(false);

  const withdrawTokens = async (amount: string, recipient: Address) => {
    if (!tokenAddress) {
      throw new Error("Token address not provided");
    }

    // Sync if needed
    if (needsSync) {
      setIsSyncing(true);
      try {
        await syncTokenBalance(tokenAddress);
        // Wait for sync to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
      } finally {
        setIsSyncing(false);
      }
    }

    // Convert to smallest unit
    const amountInSmallestUnit = parseUnits(amount, HTS_DECIMALS);
    const int64Amount = toInt64(amountInSmallestUnit);

    // Verify sufficient balance
    if (actualBalance < int64Amount) {
      throw new Error("Insufficient balance");
    }

    await withdrawTo(tokenAddress, int64Amount, recipient);
  };

  return {
    withdrawTokens,
    isSyncing,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    refetchBalance: () => {
      refetchTracked();
      refetchActual();
    },
  };
}