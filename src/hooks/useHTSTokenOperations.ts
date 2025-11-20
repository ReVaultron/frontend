import { useState, useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import {
  useUserVaultWrite,
  useTokenBalance,
  useTokenAssociation,
  toInt64,
} from "@/hooks/useContracts";
import { parseUnits } from "viem";
import type { Address } from "viem";
import { ETH_DECIMALS } from "@/lib/constants";

/* --- 1️⃣ HTS Token Association --- */
export function useTokenAssociationOperations(
  vaultAddress?: Address,
  tokenAddress?: Address
) {
  const { isVaultAssociated, isAccountAssociated } = useTokenAssociation(
    vaultAddress,
    tokenAddress
  );
  const { associateToken, isPending, isSuccess, error, hash, resetTxState } =
    useUserVaultWrite(vaultAddress);

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const associate = async () => {
    if (!tokenAddress) throw new Error("Token address not provided");
    resetTxState();
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
    resetTxState,
  };
}

/* --- 2️⃣ HTS Deposit --- */
export function useHTSDeposit(vaultAddress?: Address, tokenAddress?: Address) {
  const { deposit, isPending, isSuccess, error, hash, resetTxState } =
    useUserVaultWrite(vaultAddress);
  const { isVaultAssociated } = useTokenAssociation(vaultAddress, tokenAddress);
  const { refetchTracked, refetchActual } = useTokenBalance(
    vaultAddress,
    tokenAddress
  );

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const depositTokens = async (amount: string) => {
    if (!tokenAddress) throw new Error("Token address not provided");
    if (!isVaultAssociated) throw new Error("Vault not associated with token");

    resetTxState();
    const smallest = parseUnits(amount, ETH_DECIMALS);
    await deposit(tokenAddress, toInt64(smallest));
  };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        refetchTracked();
        refetchActual();
        resetTxState();
      }, 2000);
    }
  }, [isSuccess]);

  return {
    depositTokens,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    resetTxState,
  };
}

/* --- 3️⃣ HTS Withdraw --- */
export function useHTSWithdraw(vaultAddress?: Address, tokenAddress?: Address) {
  const {
    withdrawTo,
    syncTokenBalance,
    isPending,
    isSuccess,
    error,
    hash,
    resetTxState,
  } = useUserVaultWrite(vaultAddress);
  const { actualBalance, needsSync, refetchTracked, refetchActual } =
    useTokenBalance(vaultAddress, tokenAddress);
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [isSyncing, setIsSyncing] = useState(false);

  const withdrawTokens = async (amount: string, recipient: Address) => {
    if (!tokenAddress) throw new Error("Token address not provided");
    resetTxState();

    if (needsSync) {
      setIsSyncing(true);
      await syncTokenBalance(tokenAddress);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsSyncing(false);
    }

    const intAmount = toInt64(parseUnits(amount, ETH_DECIMALS));
    if (actualBalance < intAmount) throw new Error("Insufficient balance");

    await withdrawTo(tokenAddress, intAmount, recipient);
  };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        refetchTracked();
        refetchActual();
        resetTxState();
      }, 2000);
    }
  }, [isSuccess]);

  return {
    withdrawTokens,
    isSyncing,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    resetTxState,
  };
}
