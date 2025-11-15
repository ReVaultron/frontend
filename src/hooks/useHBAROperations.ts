// hooks/useHBAROperations.ts
import { useState } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { useUserVaultWrite, useUserVaultData } from "@/hooks/useContracts";
import { parseUnits, formatUnits } from "viem";
import type { Address } from "viem";

// Hedera uses 8 decimals (tinybars), not 18 like Ethereum
const ETH_DECIMALS = 18;
const HBAR_DECIMALS = 8;

export function useHBARDeposit(vaultAddress?: Address) {
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  const { refetchHbarBalance } = useUserVaultData(vaultAddress);
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const depositHBAR = async (amount: string) => {
    if (!vaultAddress) {
      throw new Error("Vault address not provided");
    }

    // Convert HBAR to tinybars (18 decimals)
    const amountInTinybars = parseUnits(amount, ETH_DECIMALS);
    
    // Send HBAR directly to vault address (uses receive() function)
    sendTransaction({
      to: vaultAddress,
      value: amountInTinybars,
    });
  };

  return {
    depositHBAR,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    refetchHbarBalance,
  };
}

export function useHBARWithdraw(vaultAddress?: Address) {
  const { address } = useAccount();
  const { withdrawHBAR, isPending, isSuccess, error, hash } = useUserVaultWrite(vaultAddress);
  const { refetchHbarBalance } = useUserVaultData(vaultAddress);
  
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = async (amount: string, recipient?: Address) => {
    if (!vaultAddress) {
      throw new Error("Vault address not provided");
    }

    const recipientAddress = recipient || address;
    if (!recipientAddress) {
      throw new Error("Recipient address not provided");
    }

    // Convert HBAR to tinybars
    const amountInTinybars = parseUnits(amount, HBAR_DECIMALS);

    await withdrawHBAR(amountInTinybars, recipientAddress);
  };

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    refetchHbarBalance,
  };
}
