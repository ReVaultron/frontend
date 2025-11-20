// hooks/useERC20Operations.ts
import { useState, useEffect } from "react";
import { useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { useUserVaultWrite, useUserVaultData } from "@/hooks/useContracts";
import { parseUnits, erc20Abi } from "viem";
import type { Address } from "viem";

const DEFAULT_ERC20_DECIMALS = 18;

/* --- 1️⃣ ERC20 Info Hook --- */
export function useERC20TokenInfo(tokenAddress?: Address, accountAddress?: Address) {
  const { data: decimals } = useReadContract({ address: tokenAddress, abi: erc20Abi, functionName: "decimals" });
  const { data: symbol } = useReadContract({ address: tokenAddress, abi: erc20Abi, functionName: "symbol" });
  const { data: name } = useReadContract({ address: tokenAddress, abi: erc20Abi, functionName: "name" });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: accountAddress ? [accountAddress] : undefined,
    query: { enabled: !!(tokenAddress && accountAddress) },
  });

  return {
    decimals: decimals ? Number(decimals) : DEFAULT_ERC20_DECIMALS,
    symbol: symbol as string | undefined,
    name: name as string | undefined,
    balance: balance || BigInt(0),
    refetchBalance,
  };
}

/* --- 2️⃣ Approve Tokens --- */
export function useERC20Approve(tokenAddress?: Address, spenderAddress?: Address) {
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<Error | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resetTxState = () => {
    setHash(undefined);
    setError(null);
  };

  const approve = async (amount: bigint) => {
    if (!tokenAddress || !spenderAddress) throw new Error("Token or spender address not provided");
    resetTxState();

    try {
      console.log("Approving ERC20:", amount.toString());
      // TODO: integrate with writeContract
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { approve, isConfirming, isSuccess, error, hash, resetTxState };
}

/* --- 3️⃣ Deposit ERC20 into Vault --- */
export function useERC20Deposit(vaultAddress?: Address, tokenAddress?: Address) {
  const { address } = useAccount();
  const { depositERC20, isPending, isSuccess, error, hash, resetTxState } = useUserVaultWrite(vaultAddress);
  const { decimals, balance, refetchBalance } = useERC20TokenInfo(tokenAddress, address);
  const { refetchHbarBalance } = useUserVaultData(vaultAddress);
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const depositTokens = async (amount: string) => {
    if (!vaultAddress || !tokenAddress) throw new Error("Vault or Token address missing");
    resetTxState();

    const smallestUnit = parseUnits(amount, decimals);
    if (balance < smallestUnit) throw new Error("Insufficient token balance");
    await depositERC20(tokenAddress, smallestUnit);
  };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        refetchBalance();
        refetchHbarBalance();
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
    decimals,
    balance,
    resetTxState,
  };
}

/* --- 4️⃣ Withdraw ERC20 from Vault --- */
export function useERC20Withdraw(vaultAddress?: Address, tokenAddress?: Address) {
  const { withdrawERC20To, isPending, isSuccess, error, hash, resetTxState } = useUserVaultWrite(vaultAddress);
  const { erc20BalanceRaw, refetchHbarBalance } = useUserVaultData(vaultAddress);
  const { decimals, refetchBalance } = useERC20TokenInfo(tokenAddress, vaultAddress);
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const withdrawTokens = async (amount: string, recipient: Address) => {
    if (!vaultAddress || !tokenAddress) throw new Error("Vault or Token address missing");
    resetTxState();

    const smallestUnit = parseUnits(amount, decimals);
    if (erc20BalanceRaw < smallestUnit) throw new Error("Insufficient vault balance");

    await withdrawERC20To(tokenAddress, smallestUnit, recipient);
  };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        refetchBalance();
        refetchHbarBalance();
        resetTxState();
      }, 2000);
    }
  }, [isSuccess]);

  return {
    withdrawTokens,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    decimals,
    resetTxState,
  };
}
