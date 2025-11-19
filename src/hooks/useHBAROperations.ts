// hooks/useHBAROperations.ts
import { useEffect, useState } from "react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useUserVaultWrite, useUserVaultData } from "@/hooks/useContracts";
import { parseUnits, formatUnits } from "viem";
import type { Address } from "viem";
import { ETH_DECIMALS } from "@/lib/constants";

export function useHBARDeposit(vaultAddress?: Address) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txError, setTxError] = useState<any>(null);

  const {
    sendTransaction,
    data: wagmiHash,
    isPending,
    error: wagmiError,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  // sync wagmi hash and error
  useEffect(() => {
    if (wagmiHash) setTxHash(wagmiHash);
    if (wagmiError) setTxError(wagmiError);
  }, [wagmiHash, wagmiError]);

  // 🧹 Reset function after success or fail
  const resetTxState = () => {
    setTxHash(undefined);
    setTxError(null);
  };

  const depositHBAR = async (amount: string) => {
    if (!vaultAddress) throw new Error("Vault address not provided");
    const amountInTinybars = parseUnits(amount, ETH_DECIMALS);

    resetTxState(); // reset before new tx

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
    hash: txHash,
    error: txError,
    resetTxState,
  };
}


export function useHBARWithdraw(vaultAddress?: Address) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txError, setTxError] = useState<any>(null);

  const { address } = useAccount();
  const { withdrawHBAR, isPending, isSuccess, error: wagmiError, hash: wagmiHash } =
    useUserVaultWrite(vaultAddress);
  const { refetchHbarBalance } = useUserVaultData(vaultAddress);

  const { isLoading: isConfirming } =
    useWaitForTransactionReceipt({ hash: txHash });

  // sync wagmi hash and error
  useEffect(() => {
    if (wagmiHash) setTxHash(wagmiHash);
    if (wagmiError) setTxError(wagmiError);
  }, [wagmiHash, wagmiError]);

  // 🧹 Reset function after success or fail
  const resetTxState = () => {
    setTxHash(undefined);
    setTxError(null);
  };
  const withdraw = async (amount: string, recipient?: Address) => {
    if (!vaultAddress) {
      throw new Error("Vault address not provided");
    }

    resetTxState();

    const recipientAddress = recipient || address;
    if (!recipientAddress) {
      throw new Error("Recipient address not provided");
    }

    // Convert HBAR to tinybars
    const amountInTinybars = parseUnits(amount, ETH_DECIMALS);

    await withdrawHBAR(amountInTinybars, recipientAddress);
  };

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error: txError,
    hash: txHash,
    refetchHbarBalance,
  };
}
