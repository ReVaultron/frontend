// components/vault/HBARWithdrawModal.tsx

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowUpFromLine, Loader2, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { useHBARWithdraw } from "@/hooks/useHBAROperations";
import { formatAmountInput, useHBARWithdrawValidation, useRecipientValidation } from "@/hooks/useBalanceValidation";
import { useUserVaultData } from "@/hooks/useContracts";
import { formatUnits } from "viem";
import type { Address } from "viem";
import { useAccount } from "wagmi";

const HBAR_DECIMALS = 8;
interface HBARWithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
}

export function HBARWithdrawModal({ open, onOpenChange, vaultAddress }: HBARWithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState<Address | "">("");
  const [showValidation, setShowValidation] = useState(false);

  const { address } = useAccount();
  const { hbarBalanceRaw, refetchHbarBalance } = useUserVaultData(vaultAddress);
  const { validate: validateAmount } = useHBARWithdrawValidation(vaultAddress);
  const { validate: validateRecipient } = useRecipientValidation();
  const { 
    withdraw, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error, 
    hash 
  } = useHBARWithdraw(vaultAddress);

  // Auto-fill recipient with connected address
  useEffect(() => {
    if (address) {
      setRecipient(address);
    }
  }, [address]);

  // Validate amount and recipient
  const amountValidation = useMemo(() => {
    if (!showValidation || !amount) return { isValid: true };
    return validateAmount(amount, hbarBalanceRaw);
  }, [amount, hbarBalanceRaw, showValidation, validateAmount]);

  const recipientValidation = useMemo(() => {
    if (!showValidation || !recipient) return { isValid: true };
    return validateRecipient(recipient);
  }, [recipient, showValidation, validateRecipient]);

  const isFormValid = amountValidation.isValid && recipientValidation.isValid;

  // Refetch balance after successful withdrawal
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
    const formatted = formatAmountInput(value, HBAR_DECIMALS);
    setAmount(formatted);
    setShowValidation(true);
  };

  const handleRecipientChange = (value: string) => {
    setRecipient(value as Address);
    setShowValidation(true);
  };

  const handleMaxClick = () => {
    const maxAmount = formatUnits(hbarBalanceRaw, HBAR_DECIMALS);
    setAmount(maxAmount);
    setShowValidation(true);
  };

  const handleWithdraw = async () => {
    setShowValidation(true);

    if (!isFormValid) {
      return;
    }

    try {
      await withdraw(amount, recipient);
    } catch (err) {
      console.error("Withdrawal failed:", err);
    }
  };

  const currentBalance = formatUnits(hbarBalanceRaw, HBAR_DECIMALS);
  const canWithdraw = isFormValid && !isPending && !isConfirming && !isSuccess;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw HBAR from Vault</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Info */}
          <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Available to Withdraw</p>
            <p className="text-2xl font-bold">{parseFloat(currentBalance).toFixed(8)} HBAR</p>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => handleRecipientChange(e.target.value)}
              disabled={isPending || isConfirming}
              className={
                showValidation && !recipientValidation.isValid
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {address && recipient === address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Withdrawing to your connected wallet
              </p>
            )}
          </div>

          {/* Recipient Validation */}
          {showValidation && recipientValidation.error && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{recipientValidation.error}</AlertDescription>
            </Alert>
          )}

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
                Max: {parseFloat(currentBalance).toFixed(8)}
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
                  showValidation && !amountValidation.isValid
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                HBAR
              </div>
            </div>
          </div>

          {/* Amount Validation */}
          {showValidation && amountValidation.error && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{amountValidation.error}</AlertDescription>
            </Alert>
          )}

          {showValidation && amountValidation.warning && amountValidation.isValid && (
            <Alert className="border-yellow-500">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>{amountValidation.warning}</AlertDescription>
            </Alert>
          )}

          {/* Transaction Summary */}
          {amount && parseFloat(amount) > 0 && recipient && isFormValid && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will receive</span>
                <span className="font-medium">{parseFloat(amount).toFixed(8)} HBAR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining vault balance</span>
                <span className="font-medium">
                  {Math.max(0, parseFloat(currentBalance) - parseFloat(amount)).toFixed(8)} HBAR
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-muted-foreground">Gas fee</span>
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
                Processing withdrawal...
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
                Withdrawal successful!
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
                  {error.message || "Withdrawal failed. Please try again."}
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
              onClick={handleWithdraw}
              disabled={!canWithdraw}
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
                  Withdrawn!
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="mr-2 h-4 w-4" />
                  Withdraw HBAR
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}