// components/vault/HBARWithdrawModal.tsx

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowUpFromLine,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useHBARWithdraw } from "@/hooks/useHBAROperations";
import {
  formatAmountInput,
  useHBARWithdrawValidation,
  useRecipientValidation,
} from "@/hooks/useBalanceValidation";
import { useUserVaultData } from "@/hooks/useContracts";
import { formatUnits } from "viem";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { ETH_DECIMALS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface HBARWithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
}

export function HBARWithdrawModal({
  open,
  onOpenChange,
  vaultAddress,
}: HBARWithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState<Address>(
    "0x0000000000000000000000000000000000000000"
  );
  const [showValidation, setShowValidation] = useState(false);
  const { toast } = useToast();
  const { address: userAddress } = useAccount();

  const { hbarBalanceRaw, refetchHbarBalance } = useUserVaultData(vaultAddress);
  const { validate: validateAmount } = useHBARWithdrawValidation();
  const { validate: validateRecipient } = useRecipientValidation();
  const { withdraw, isPending, isConfirming, isSuccess, error, hash } =
    useHBARWithdraw(vaultAddress);

  // Auto-fill recipient with connected address
  useEffect(() => {
    if (userAddress) {
      setRecipient(userAddress);
    }
  }, [userAddress]);

  // Validate both amount and recipient
  const validation = useMemo(() => {
    if (!showValidation) return { isValid: true };

    const amountValidation = amount
      ? validateAmount(amount, hbarBalanceRaw)
      : { isValid: true };
    const recipientValidation = recipient
      ? validateRecipient(recipient)
      : { isValid: true };

    return {
      isValid: amountValidation.isValid && recipientValidation.isValid,
      amountError: amountValidation.error,
      recipientError: recipientValidation.error,
      warning: amountValidation.warning,
    };
  }, [amount, recipient, showValidation, validateAmount, validateRecipient]);

  const currentBalance = formatUnits(hbarBalanceRaw, ETH_DECIMALS);

  // Show success toast and refetch balance
  useEffect(() => {
    if (isSuccess && hash && amount) {
      const withdrawnAmount = parseFloat(amount).toFixed(2);
      toast({
        title: "Withdrawal Successful! ✅",
        description: (
          <div className="space-y-2">
            <p>
              Successfully withdrew {withdrawnAmount} HBAR from
              your vault.
            </p>
            <a
              href={`https://hashscan.io/testnet/transaction/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm block"
            >
              View on HashScan ↗
            </a>
          </div>
        ),
        duration: 5000,
      });

      // Refetch balance after short delay
      setTimeout(() => {
        refetchHbarBalance();
      }, 2000);

      // Reset and close modal
      setTimeout(() => {
        setAmount("");
        setRecipient("0x0000000000000000000000000000000000000000");
        setShowValidation(false);
        onOpenChange(false);
      }, 1500);
    }
  }, [isSuccess, hash, amount, toast, refetchHbarBalance, onOpenChange]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed ❌",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">Withdrawal could not be completed</p>
            <p className="text-sm opacity-90">
              {error.message || "An error occurred. Please try again."}
            </p>
          </div>
        ),
        duration: 7000,
      });
    }
  }, [error, toast]);

  // Reset validation when modal opens
  useEffect(() => {
    if (open) {
      setShowValidation(false);
      // Auto-fill recipient with user's address
      if (userAddress) {
        setRecipient(userAddress);
      }
    }
  }, [open, userAddress]);

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value, ETH_DECIMALS);
    setAmount(formatted);
    setShowValidation(true);
  };

  const handleMaxClick = () => {
    setAmount(currentBalance);
    setShowValidation(true);
  };

  const handleWithdraw = async () => {
    setShowValidation(true);

    if (!validation.isValid) {
      return;
    }

    try {
      await withdraw(amount, recipient as Address);
    } catch (err) {
      console.error("Withdrawal failed:", err);
    }
  };

  const canWithdraw =
    validation.isValid && !isPending && !isConfirming && !isSuccess;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw HBAR from Vault</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              Available Balance
            </p>
            <p className="text-lg font-bold">
              {parseFloat(currentBalance).toFixed(2)} HBAR
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="withdraw-amount">Amount (HBAR)</Label>
              <Button
                variant="link"
                size="sm"
                onClick={handleMaxClick}
                disabled={isPending || isConfirming}
                className="h-auto p-0 text-xs"
              >
                Max: {parseFloat(currentBalance).toFixed(2)}
              </Button>
            </div>
            <div className="relative">
              <Input
                id="withdraw-amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={isPending || isConfirming}
                className={
                  showValidation && validation.amountError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                HBAR
              </div>
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => {
                setRecipient(`0x${e.target.value}`);
                setShowValidation(true);
              }}
              disabled={isPending || isConfirming}
              className={
                showValidation && validation.recipientError
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Enter the Hedera EVM address to receive HBAR</span>
            </div>
          </div>

          {/* Validation Messages */}
          {showValidation && validation.amountError && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{validation.amountError}</AlertDescription>
            </Alert>
          )}

          {showValidation && validation.recipientError && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{validation.recipientError}</AlertDescription>
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
                <span className="text-muted-foreground">You will withdraw</span>
                <span className="font-medium">
                  {parseFloat(amount).toFixed(2)} HBAR
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining balance</span>
                <span className="font-medium">
                  {(parseFloat(currentBalance) - parseFloat(amount)).toFixed(2)}{" "}
                  HBAR
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
