// components/vault/ERC20WithdrawModal.tsx
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Coins 
} from "lucide-react";
import { useERC20Withdraw, useERC20TokenInfo } from "@/hooks/useERC20Operations";
import { useUserVaultData } from "@/hooks/useContracts";
import { formatUnits, isAddress } from "viem";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

interface ERC20WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
  tokenAddress: Address;
}

export function ERC20WithdrawModal({ 
  open, 
  onOpenChange, 
  vaultAddress,
  tokenAddress 
}: ERC20WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState<Address>("0x0000000000000000000000000000000000000000");
  const [showValidation, setShowValidation] = useState(false);
  const { toast } = useToast();

  const { address: userAddress } = useAccount();
  const { erc20BalanceRaw, refetchHbarBalance } = useUserVaultData(vaultAddress);
  const { 
    decimals, 
    symbol, 
    name 
  } = useERC20TokenInfo(tokenAddress, vaultAddress);
  
  const { 
    withdrawTokens, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error, 
    hash,
    resetTxState,
    refetchBalance 
  } = useERC20Withdraw(vaultAddress, tokenAddress);

  const vaultBalance = formatUnits(erc20BalanceRaw, decimals);

  // Auto-fill recipient
  useEffect(() => {
    if (userAddress) {
      setRecipient(userAddress);
    }
  }, [userAddress]);

  // Validations
  const recipientValidation = useMemo(() => {
    if (!showValidation || !recipient) return { isValid: true };
    if (!isAddress(recipient)) {
      return { isValid: false, error: "Invalid recipient address" };
    }
    return { isValid: true };
  }, [recipient, showValidation]);

  const amountValidation = useMemo(() => {
    if (!showValidation || !amount) return { isValid: true };

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return { 
        isValid: false, 
        error: "Please enter a valid amount greater than 0" 
      };
    }

    const decimalPlaces = amount.split('.')[1]?.length || 0;
    if (decimalPlaces > decimals) {
      return { 
        isValid: false, 
        error: `Maximum ${decimals} decimal places allowed` 
      };
    }

    const maxBalance = parseFloat(vaultBalance);
    if (numAmount > maxBalance) {
      return { 
        isValid: false, 
        error: `Amount exceeds vault balance (${maxBalance} ${symbol})` 
      };
    }

    if (numAmount === maxBalance && maxBalance > 0) {
      return { 
        isValid: true,
        warning: "You're withdrawing your entire vault balance." 
      };
    }

    return { isValid: true };
  }, [amount, showValidation, vaultBalance, decimals, symbol]);

  const isFormValid = amountValidation.isValid && recipientValidation.isValid;

  // Show success toast
  useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: `${symbol} Withdrawal Successful! ✅`,
        description: (
          <div className="space-y-2">
            <p>
              Successfully withdrew {parseFloat(amount).toFixed(Math.min(2, decimals))} {symbol} from your vault.
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
        refetchHbarBalance();
      }, 2000);

      setTimeout(() => {
        setAmount("");
        resetTxState();
        setShowValidation(false);
        onOpenChange(false);
      }, 1500);
    }
  }, [isSuccess, hash, amount, symbol, decimals, toast, refetchBalance, refetchHbarBalance, onOpenChange]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Withdrawal Failed ❌",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">{symbol} withdrawal could not be completed</p>
            <p className="text-sm opacity-90">
              {error.message || "Withdrawal failed. Please try again."}
            </p>
          </div>
        ),
        duration: 7000,
      });
      setTimeout(() => {
        resetTxState(); // 🔥 clear error & hash
        setShowValidation(false);
      }, 2000);
    }
  }, [error, symbol, toast]);

  useEffect(() => {
    if (open) {
      setShowValidation(false);
    }
  }, [open]);

  const handleAmountChange = (value: string) => {
    const formatted = value.replace(/[^\d.]/g, '');
    const parts = formatted.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > decimals) return;
    
    setAmount(formatted);
    setShowValidation(true);
  };

  const handleRecipientChange = (value: string) => {
    setRecipient(value as Address);
    setShowValidation(true);
  };

  const handleMaxClick = () => {
    setAmount(vaultBalance);
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

  const canWithdraw = isFormValid && !isPending && !isConfirming && !isSuccess;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Withdraw {symbol || "ERC20"} from Vault
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Token Info */}
          {name && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Token</p>
              <p className="font-medium">{name} ({symbol})</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                {tokenAddress}
              </p>
            </div>
          )}

          {/* Balance Info */}
          <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Available to Withdraw</p>
            <p className="text-2xl font-bold">
              {parseFloat(vaultBalance).toFixed(Math.min(2, decimals))} {symbol}
            </p>
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
            {userAddress && recipient === userAddress && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Withdrawing to your connected wallet
              </p>
            )}
          </div>

          {showValidation && recipientValidation.error && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{recipientValidation.error}</AlertDescription>
            </Alert>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount">Amount ({symbol})</Label>
              <Button
                variant="link"
                size="sm"
                onClick={handleMaxClick}
                disabled={isPending || isConfirming}
                className="h-auto p-0 text-xs"
              >
                Max: {parseFloat(vaultBalance).toFixed(Math.min(2, decimals))}
              </Button>
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder={`0.${'0'.repeat(Math.min(2, decimals))}`}
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={isPending || isConfirming}
                className={
                  showValidation && !amountValidation.isValid
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                {symbol}
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

          {/* Transaction Summary */}
          {amount && parseFloat(amount) > 0 && recipient && isFormValid && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will receive</span>
                <span className="font-medium">
                  {parseFloat(amount).toFixed(Math.min(2, decimals))} {symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining vault balance</span>
                <span className="font-medium">
                  {Math.max(0, parseFloat(vaultBalance) - parseFloat(amount)).toFixed(Math.min(2, decimals))} {symbol}
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
              <AlertDescription>Waiting for wallet confirmation...</AlertDescription>
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
                  Withdraw {symbol}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}