// hooks/useVaultCreation.ts
import { useState, useEffect } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { 
  useFactoryVaultWrite, 
  useFactoryVaultData, 
  useUserVaultAddress 
} from "@/hooks/useContracts";

export function useVaultCreation() {
  const { address, isConnected } = useAccount();
  const { creationFeeRaw } = useFactoryVaultData();
  const { vaultAddress, hasVault } = useUserVaultAddress(address);
  const { createVault, isPending, isSuccess, error, hash } = useFactoryVaultWrite();
  
  const [creationStep, setCreationStep] = useState<
    "idle" | "checking" | "creating" | "confirming" | "success" | "error"
  >("idle");

  // Wait for transaction confirmation
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  // Update creation step based on transaction state
  useEffect(() => {
    if (isPending) {
      setCreationStep("creating");
    } else if (isConfirming) {
      setCreationStep("confirming");
    } else if (isSuccess && receipt) {
      setCreationStep("success");
    } else if (error) {
      setCreationStep("error");
    }
  }, [isPending, isConfirming, isSuccess, receipt, error]);

  const initiateCreation = async () => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    if (hasVault) {
      throw new Error("User already has a vault");
    }

    setCreationStep("checking");

    try {
      // Create vault with creation fee
      await createVault(creationFeeRaw);
    } catch (err) {
      setCreationStep("error");
      throw err;
    }
  };

  return {
    initiateCreation,
    creationStep,
    hasVault,
    vaultAddress,
    creationFeeRaw,
    isPending,
    isConfirming,
    isSuccess,
    error,
    receipt,
    transactionHash: hash,
  };
}