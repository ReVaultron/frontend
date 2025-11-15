// hooks/useBalanceValidation.ts
import { useAccount, useBalance } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import type { Address } from "viem";

const ETH_DECIMALS = 18;
const HBAR_DECIMALS = 8;
const HTS_DECIMALS = 8;

// Minimum amounts to prevent dust
const MIN_HBAR_AMOUNT = "0.00000001"; // 1 tinybar
const MIN_HTS_AMOUNT = "0.00000001"; // 1 unit

// int64 max value for HTS
const MAX_INT64 = BigInt("9223372036854775807");

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validate HBAR deposit amount
 */
export function useHBARDepositValidation(vaultAddress?: Address) {
  const { address } = useAccount();
  const { data: walletBalance } = useBalance({ address });

  const validate = (amount: string): ValidationResult => {
    if (!amount || amount === "") {
      return { isValid: false, error: "Amount is required" };
    }

    const amountNum = parseFloat(amount);

    // Check if valid number
    if (isNaN(amountNum) || amountNum <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }

    // Check minimum amount
    if (amountNum < parseFloat(MIN_HBAR_AMOUNT)) {
      return {
        isValid: false,
        error: `Minimum deposit is ${MIN_HBAR_AMOUNT} HBAR (1 tinybar)`,
      };
    }

    // Check maximum (int64)
    try {
      const amountInTinybars = parseUnits(amount, HBAR_DECIMALS);
      if (amountInTinybars > MAX_INT64) {
        return {
          isValid: false,
          error: `Amount exceeds maximum value (${formatUnits(MAX_INT64, HBAR_DECIMALS)} HBAR)`,
        };
      }
    } catch (err) {
      return { isValid: false, error: "Invalid amount format" };
    }

    // Check wallet balance
    if (walletBalance) {
      const walletHBAR = parseFloat(formatUnits(walletBalance.value, ETH_DECIMALS));
      const gasReserve = 0.1; // Reserve for gas

      if (amountNum > walletHBAR) {
        return {
          isValid: false,
          error: `Insufficient balance. You have ${walletHBAR.toFixed(8)} HBAR`,
        };
      }

      if (amountNum > walletHBAR - gasReserve) {
        return {
          isValid: false,
          error: "Insufficient balance for deposit + gas fees",
          warning: `Reserve at least ${gasReserve} HBAR for gas`,
        };
      }

      // Warning if depositing most of balance
      if (amountNum > walletHBAR * 0.9) {
        return {
          isValid: true,
          warning: `You're depositing ${((amountNum / walletHBAR) * 100).toFixed(1)}% of your balance. Keep some HBAR for gas fees.`,
        };
      }
    }

    return { isValid: true };
  };

  return { validate, walletBalance };
}

/**
 * Validate HBAR withdrawal amount
 */
export function useHBARWithdrawValidation(vaultAddress?: Address) {
  const { address } = useAccount();
  
  const validate = (amount: string, vaultBalance: bigint): ValidationResult => {
    if (!amount || amount === "") {
      return { isValid: false, error: "Amount is required" };
    }

    const amountNum = parseFloat(amount);

    // Check if valid number
    if (isNaN(amountNum) || amountNum <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }

    // Check minimum amount
    if (amountNum < parseFloat(MIN_HBAR_AMOUNT)) {
      return {
        isValid: false,
        error: `Minimum withdrawal is ${MIN_HBAR_AMOUNT} HBAR`,
      };
    }

    // Check vault balance
    const vaultHBAR = parseFloat(formatUnits(vaultBalance, HBAR_DECIMALS));
    
    if (vaultHBAR === 0) {
      return {
        isValid: false,
        error: "No HBAR in vault to withdraw",
      };
    }

    if (amountNum > vaultHBAR) {
      return {
        isValid: false,
        error: `Insufficient vault balance. Available: ${vaultHBAR.toFixed(8)} HBAR`,
      };
    }

    // Check int64 max
    try {
      const amountInTinybars = parseUnits(amount, HBAR_DECIMALS);
      if (amountInTinybars > MAX_INT64) {
        return {
          isValid: false,
          error: "Amount exceeds maximum value",
        };
      }
    } catch (err) {
      return { isValid: false, error: "Invalid amount format" };
    }

    // Warning if withdrawing all
    if (Math.abs(amountNum - vaultHBAR) < 0.00000001) {
      return {
        isValid: true,
        warning: "You're withdrawing all HBAR from the vault",
      };
    }

    return { isValid: true };
  };

  return { validate };
}

/**
 * Validate HTS token deposit amount
 */
export function useHTSDepositValidation(
  vaultAddress?: Address,
  tokenAddress?: Address
) {
  const { address } = useAccount();
  
  // In production, you would fetch actual token balance here
  // For now, we'll validate structure
  
  const validate = (amount: string, userTokenBalance?: bigint): ValidationResult => {
    if (!amount || amount === "") {
      return { isValid: false, error: "Amount is required" };
    }

    const amountNum = parseFloat(amount);

    // Check if valid number
    if (isNaN(amountNum) || amountNum <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }

    // Check minimum amount
    if (amountNum < parseFloat(MIN_HTS_AMOUNT)) {
      return {
        isValid: false,
        error: `Minimum deposit is ${MIN_HTS_AMOUNT} tokens`,
      };
    }

    // Check int64 max (HTS uses int64)
    try {
      const amountInSmallestUnit = parseUnits(amount, HTS_DECIMALS);
      if (amountInSmallestUnit > MAX_INT64) {
        return {
          isValid: false,
          error: `Amount exceeds maximum value (${formatUnits(MAX_INT64, HTS_DECIMALS)} tokens)`,
        };
      }
    } catch (err) {
      return { isValid: false, error: "Invalid amount format" };
    }

    // Check user balance if provided
    if (userTokenBalance !== undefined) {
      const userBalance = parseFloat(formatUnits(userTokenBalance, HTS_DECIMALS));
      
      if (userBalance === 0) {
        return {
          isValid: false,
          error: "You don't have any tokens to deposit",
        };
      }

      if (amountNum > userBalance) {
        return {
          isValid: false,
          error: `Insufficient balance. You have ${userBalance.toFixed(8)} tokens`,
        };
      }

      // Warning if depositing all
      if (Math.abs(amountNum - userBalance) < 0.00000001) {
        return {
          isValid: true,
          warning: "You're depositing all your tokens",
        };
      }
    }

    return { isValid: true };
  };

  return { validate };
}

/**
 * Validate HTS token withdrawal amount
 */
export function useHTSWithdrawValidation(
  vaultAddress?: Address,
  tokenAddress?: Address
) {
  const validate = (amount: string, vaultTokenBalance: bigint): ValidationResult => {
    if (!amount || amount === "") {
      return { isValid: false, error: "Amount is required" };
    }

    const amountNum = parseFloat(amount);

    // Check if valid number
    if (isNaN(amountNum) || amountNum <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }

    // Check minimum amount
    if (amountNum < parseFloat(MIN_HTS_AMOUNT)) {
      return {
        isValid: false,
        error: `Minimum withdrawal is ${MIN_HTS_AMOUNT} tokens`,
      };
    }

    // Check vault balance
    const vaultBalance = parseFloat(formatUnits(vaultTokenBalance, HTS_DECIMALS));
    
    if (vaultBalance === 0) {
      return {
        isValid: false,
        error: "No tokens in vault to withdraw",
      };
    }

    if (amountNum > vaultBalance) {
      return {
        isValid: false,
        error: `Insufficient vault balance. Available: ${vaultBalance.toFixed(8)} tokens`,
      };
    }

    // Check int64 max
    try {
      const amountInSmallestUnit = parseUnits(amount, HTS_DECIMALS);
      if (amountInSmallestUnit > MAX_INT64) {
        return {
          isValid: false,
          error: "Amount exceeds maximum value",
        };
      }
    } catch (err) {
      return { isValid: false, error: "Invalid amount format" };
    }

    // Warning if withdrawing all
    if (Math.abs(amountNum - vaultBalance) < 0.00000001) {
      return {
        isValid: true,
        warning: "You're withdrawing all tokens from the vault",
      };
    }

    return { isValid: true };
  };

  return { validate };
}

/**
 * Validate recipient address
 */
export function useRecipientValidation() {
  const validate = (recipient: string): ValidationResult => {
    if (!recipient || recipient === "") {
      return { isValid: false, error: "Recipient address is required" };
    }

    // Check if valid address format
    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      return {
        isValid: false,
        error: "Invalid address format. Must start with 0x and be 42 characters",
      };
    }

    // Check if not zero address
    if (recipient === "0x0000000000000000000000000000000000000000") {
      return {
        isValid: false,
        error: "Cannot send to zero address",
      };
    }

    return { isValid: true };
  };

  return { validate };
}

/**
 * Format and validate amount input
 */
export function formatAmountInput(value: string, decimals: number = 8): string {
  // Remove non-numeric characters except decimal point
  let formatted = value.replace(/[^\d.]/g, "");

  // Ensure only one decimal point
  const parts = formatted.split(".");
  if (parts.length > 2) {
    formatted = parts[0] + "." + parts.slice(1).join("");
  }

  // Limit decimal places
  if (parts.length === 2 && parts[1].length > decimals) {
    formatted = parts[0] + "." + parts[1].slice(0, decimals);
  }

  return formatted;
}

/**
 * Calculate max amount considering gas
 */
export function calculateMaxWithGas(balance: bigint, decimals: number = 8): string {
  const gasReserve = parseUnits("0.1", decimals); // Reserve 0.1 for gas
  const maxAmount = balance > gasReserve ? balance - gasReserve : BigInt(0);
  return formatUnits(maxAmount, decimals);
}