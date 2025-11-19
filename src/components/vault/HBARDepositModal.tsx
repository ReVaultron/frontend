// components/vault/HBARDepositModal.tsx - Enhanced Version with Toast
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
  ArrowDownToLine,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHBARDeposit } from "@/hooks/useHBAROperations";
import { useUserVaultData } from "@/hooks/useContracts";
import {
  useHBARDepositValidation,
  formatAmountInput,
  calculateMaxWithGas,
} from "@/hooks/useBalanceValidation";
import { formatUnits } from "viem";
import type { Address } from "viem";
import { ETH_DECIMALS } from "@/lib/constants";

interface HBARDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
}

export function HBARDepositModal({
  open,
  onOpenChange,
  vaultAddress,
}: HBARDepositModalProps) {
  const [amount, setAmount] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const { toast } = useToast();

  const { hbarBalanceRaw, refetchHbarBalance } = useUserVaultData(vaultAddress);
  const { validate, walletBalance } = useHBARDepositValidation();
  const { depositHBAR, isPending, isConfirming, isSuccess, error, hash, resetTxState } =
    useHBARDeposit(vaultAddress);

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

  // Show success toast and refetch balance
 useEffect(() => {
  if (isSuccess && hash && amount) {
    toast({
      title: "Deposit Successful! ✅",
      description: (
        <div>
          Successfully deposited {parseFloat(amount).toFixed(2)} HBAR.
          <a
            href={`https://hashscan.io/testnet/transaction/${hash}`}
            target="_blank"
            className="text-primary hover:underline text-sm block"
          >
            View on HashScan ↗
          </a>
        </div>
      ),
      duration: 5000,
    });

    setTimeout(() => {
      refetchHbarBalance();
      onOpenChange(false); // close modal
      resetTxState();      // 🔥 reset here
      setAmount("");
      setShowValidation(false);
    }, 1500);
  }
}, [isSuccess, hash]);


  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed ❌",
        description: error?.message || "Something went wrong.",
      });

      setTimeout(() => {
        resetTxState(); // 🔥 clear error & hash
        setShowValidation(false);
      }, 2000);
    }
  }, [error]);

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

  const currentBalance = formatUnits(hbarBalanceRaw, ETH_DECIMALS);
  const canDeposit =
    validation.isValid && !isPending && !isConfirming && !isSuccess;

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
              <p className="text-xs text-muted-foreground mb-1">
                Wallet Balance
              </p>
              <p className="text-sm font-bold">
                {parseFloat(walletHBAR).toFixed(2)} HBAR
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Vault Balance
              </p>
              <p className="text-sm font-bold">
                {parseFloat(currentBalance).toFixed(2)} HBAR
              </p>
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
                Max: {parseFloat(maxDeposit).toFixed(2)}
              </Button>
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
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
              <span>Min: 1 HBAR • 8 decimal places</span>
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
                <span className="font-medium">
                  {parseFloat(amount).toFixed(2)} HBAR
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New vault balance</span>
                <span className="font-medium">
                  {(parseFloat(currentBalance) + parseFloat(amount)).toFixed(2)}{" "}
                  HBAR
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Remaining wallet balance
                </span>
                <span className="font-medium">
                  {(parseFloat(walletHBAR) - parseFloat(amount)).toFixed(2)}{" "}
                  HBAR
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-muted-foreground">Estimated gas fee</span>
                <span className="font-medium">~0.05 HBAR</span>
              </div>
            </div>
          )}

          {/* Status Messages - Only show pending/confirming in modal */}
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
              onClick={handleDeposit}
              disabled={!canDeposit}
              className="flex-1"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? "Confirm..." : "Processing..."}
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
