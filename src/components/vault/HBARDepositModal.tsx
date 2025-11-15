// components/vault/HBARDepositModal.tsx - Enhanced Version
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDownToLine, Loader2, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useHBARDeposit } from "@/hooks/useHBAROperations";
import { useUserVaultData } from "@/hooks/useContracts";
import { useHBARDepositValidation, formatAmountInput, calculateMaxWithGas } from "@/hooks/useBalanceValidation";
import { formatUnits } from "viem";
import type { Address } from "viem";

const ETH_DECIMALS = 18;
const HBAR_DECIMALS = 8;

interface HBARDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
}

export function HBARDepositModal({ open, onOpenChange, vaultAddress }: HBARDepositModalProps) {
  const [amount, setAmount] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  const { hbarBalanceRaw, refetchHbarBalance } = useUserVaultData(vaultAddress);
  const { validate, walletBalance } = useHBARDepositValidation(vaultAddress);
  const { 
    depositHBAR, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error, 
    hash 
  } = useHBARDeposit(vaultAddress);

  // Validate amount
  const validation = useMemo(() => {
    if (!showValidation || !amount) return { isValid: true };
    return validate(amount);
  }, [amount, showValidation, validate]);

  // Format wallet balance
  const walletHBAR = walletBalance 
    ? formatUnits(walletBalance.value, ETH_DECIMALS)
    : "0";

  // Calculate max deposit (wallet balance - gas reserve)
  const maxDeposit = walletBalance
    ? calculateMaxWithGas(walletBalance.value, ETH_DECIMALS)
    : "0";

  // Refetch balance after successful deposit
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        refetchHbarBalance();
      }, 2000);
    }
  }, [isSuccess, refetchHbarBalance]);

  // Reset and close after success
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setAmount("");
        setShowValidation(false);
        onOpenChange(false);
      }, 3000);
    }
  }, [isSuccess, onOpenChange]);

  // Reset validation when modal opens
  useEffect(() => {
    if (open) {
      setShowValidation(false);
    }
  }, [open]);

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value, ETH_DECIMALS);
    setAmount(formatted);
    setShowValidation(true);
  };

  const handleMaxClick = () => {
    setAmount(maxDeposit);
    setShowValidation(true);
  };

  const handleDeposit = async () => {
    setShowValidation(true);
    
    const validationResult = validate(amount);
    if (!validationResult.isValid) {
      return;
    }

    try {
      await depositHBAR(amount);
    } catch (err) {
      console.error("Deposit failed:", err);
    }
  };

  const currentBalance = formatUnits(hbarBalanceRaw, HBAR_DECIMALS);
  const canDeposit = validation.isValid && !isPending && !isConfirming && !isSuccess;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit HBAR to Vault</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
              <p className="text-sm font-bold">{parseFloat(walletHBAR).toFixed(8)} HBAR</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Vault Balance</p>
              <p className="text-sm font-bold">{parseFloat(currentBalance).toFixed(8)} HBAR</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount">Amount (HBAR)</Label>
              <Button
                variant="link"
                size="sm"
                onClick={handleMaxClick}
                disabled={isPending || isConfirming}
                className="h-auto p-0 text-xs"
              >
                Max: {parseFloat(maxDeposit).toFixed(8)}
              </Button>
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00000000"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={isPending || isConfirming}
                className={
                  showValidation && !validation.isValid
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                HBAR
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Min: 0.00000001 HBAR • 8 decimal places</span>
            </div>
          </div>

          {/* Validation Messages */}
          {showValidation && validation.error && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{validation.error}</AlertDescription>
            </Alert>
          )}

          {showValidation && validation.warning && validation.isValid && (
            <Alert className="border-yellow-500">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>{validation.warning}</AlertDescription>
            </Alert>
          )}

          {/* Transaction Summary */}
          {amount && parseFloat(amount) > 0 && validation.isValid && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will deposit</span>
                <span className="font-medium">{parseFloat(amount).toFixed(8)} HBAR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New vault balance</span>
                <span className="font-medium">
                  {(parseFloat(currentBalance) + parseFloat(amount)).toFixed(8)} HBAR
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining wallet balance</span>
                <span className="font-medium">
                  {(parseFloat(walletHBAR) - parseFloat(amount)).toFixed(8)} HBAR
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-muted-foreground">Estimated gas fee</span>
                <span className="font-medium">~0.05 HBAR</span>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Waiting for wallet confirmation...
              </AlertDescription>
            </Alert>
          )}

          {isConfirming && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Transaction submitted. Confirming on Hedera network...
                {hash && (
                  <a
                    href={`https://hashscan.io/testnet/transaction/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-primary hover:underline text-xs"
                  >
                    View on HashScan ↗
                  </a>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Deposit successful! Your vault balance will update shortly.
                {hash && (
                  <a
                    href={`https://hashscan.io/testnet/transaction/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-primary hover:underline text-xs"
                  >
                    View transaction ↗
                  </a>
                )}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <p className="font-semibold">Transaction Failed</p>
                <p className="text-xs mt-1">
                  {error.message || "An error occurred. Please try again."}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending || isConfirming}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={!canDeposit}
              className="flex-1"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? "Confirm..." : "Processing..."}
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Deposited!
                </>
              ) : (
                <>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Deposit HBAR
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// components/vault/HBARWithdrawModal.tsx - Enhanced Version
import { useAccount } from "wagmi";
import { useHBARWithdraw } from "@/hooks/useHBAROperations";
import { useHBARWithdrawValidation, useRecipientValidation } from "@/hooks/useBalanceValidation";
import { ArrowUpFromLine } from "lucide-react";

