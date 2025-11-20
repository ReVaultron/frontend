// components/vault/HTSWithdrawModal.tsx
import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
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
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  formatAmountInput,
  useHTSWithdrawValidation,
  useRecipientValidation,
} from "@/hooks/useBalanceValidation";
import { useHTSWithdraw } from "@/hooks/useHTSTokenOperations";
import { useTokenBalance } from "@/hooks/useContracts";
import { formatUnits } from "viem";
import type { Address } from "viem";
import { ETH_DECIMALS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface HTSWithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
  tokenAddress: Address;
  tokenSymbol: string;
}

export function HTSWithdrawModal({
  open,
  onOpenChange,
  vaultAddress,
  tokenAddress,
  tokenSymbol,
}: HTSWithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState<Address>("0x0000000000000000000000000000000000000000");
  const [showValidation, setShowValidation] = useState(false);
  const { toast } = useToast();

  const { address } = useAccount();
  const { actualBalance, needsSync } = useTokenBalance(vaultAddress, tokenAddress);
  const { validate: validateAmount } = useHTSWithdrawValidation();
  const { validate: validateRecipient } = useRecipientValidation();
  const {
    withdrawTokens,
    isSyncing,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    resetTxState,
    refetchBalance,
  } = useHTSWithdraw(vaultAddress, tokenAddress);

  // Auto-fill recipient
  useEffect(() => {
    if (address) {
      setRecipient(address);
    }
  }, [address]);

  // Validations
  const amountValidation = useMemo(() => {
    if (!showValidation || !amount) return { isValid: true };
    return validateAmount(amount, BigInt(actualBalance));
  }, [amount, actualBalance, showValidation, validateAmount]);

  const recipientValidation = useMemo(() => {
    if (!showValidation || !recipient) return { isValid: true };
    return validateRecipient(recipient);
  }, [recipient, showValidation, validateRecipient]);

  const isFormValid = amountValidation.isValid && recipientValidation.isValid;

  // Show success toast
  useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: `${tokenSymbol} Withdrawal Successful! ✅`,
        description: (
          <div className="space-y-2">
            <p>
              Successfully withdrew {parseFloat(amount).toFixed(2)} {tokenSymbol} from your vault.
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

      setTimeout(() => {
        refetchBalance();
      }, 2000);

      setTimeout(() => {
        setAmount("");
        resetTxState();
        setShowValidation(false);
        onOpenChange(false);
      }, 1500);
    }
  }, [isSuccess, hash, amount, tokenSymbol, toast, refetchBalance, onOpenChange]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Withdrawal Failed ❌",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">{tokenSymbol} withdrawal could not be completed</p>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
        ),
        duration: 7000,
      });
      setTimeout(() => {
        resetTxState(); // 🔥 clear error & hash
        setShowValidation(false);
      }, 2000);
    }
  }, [error, tokenSymbol, toast]);

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

  const handleRecipientChange = (value: string) => {
    setRecipient(value as Address);
    setShowValidation(true);
  };

  const handleMaxClick = () => {
    const maxAmount = formatUnits(BigInt(actualBalance), ETH_DECIMALS);
    setAmount(maxAmount);
    setShowValidation(true);
  };

  const handleWithdraw = async () => {
    setShowValidation(true);

    if (!isFormValid) {
      return;
    }

    try {
      await withdrawTokens(amount, recipient);
    } catch (err) {
      console.error("Withdrawal failed:", err);
    }
  };

  const maxWithdraw = formatUnits(BigInt(actualBalance), ETH_DECIMALS);
  const canWithdraw = isFormValid && !isSyncing && !isPending && !isConfirming && !isSuccess;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw {tokenSymbol} from Vault</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {needsSync && !isSyncing && (
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>Balance will be synced with HTS before withdrawal</AlertDescription>
            </Alert>
          )}

          {isSyncing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Syncing balance with Hedera Token Service...</AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Available to Withdraw</p>
            <p className="text-2xl font-bold">
              {parseFloat(maxWithdraw).toFixed(2)} {tokenSymbol}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => handleRecipientChange(e.target.value)}
              disabled={isPending || isConfirming || isSyncing}
              className={
                showValidation && !recipientValidation.isValid
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {address && recipient === address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Withdrawing to your wallet
              </p>
            )}
          </div>

          {showValidation && recipientValidation.error && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{recipientValidation.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">Amount ({tokenSymbol})</Label>
              <Button
                variant="link"
                size="sm"
                onClick={handleMaxClick}
                disabled={isPending || isConfirming || isSyncing}
                className="h-auto p-0 text-xs"
              >
                Max: {parseFloat(maxWithdraw).toFixed(2)}
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
                disabled={isPending || isConfirming || isSyncing}
                className={
                  showValidation && !amountValidation.isValid
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {tokenSymbol}
              </div>
            </div>
          </div>

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

          {amount && parseFloat(amount) > 0 && recipient && isFormValid && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Withdrawing</span>
                <span className="font-medium">{parseFloat(amount).toFixed(2)} {tokenSymbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">
                  {Math.max(0, parseFloat(maxWithdraw) - parseFloat(amount)).toFixed(2)} {tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-muted-foreground">Gas fee</span>
                <span className="font-medium">~0.05 HBAR</span>
              </div>
            </div>
          )}

          {isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Confirm in wallet...</AlertDescription>
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

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending || isConfirming || isSyncing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={!canWithdraw} className="flex-1">
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? "Confirm..." : "Processing..."}
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="mr-2 h-4 w-4" />
                  Withdraw {tokenSymbol}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}