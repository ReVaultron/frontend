// components/vault/ERC20DepositModal.tsx
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Coins 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useERC20Deposit, useERC20TokenInfo } from "@/hooks/useERC20Operations";
import { useUserVaultData } from "@/hooks/useContracts";
import { formatUnits } from "viem";
import type { Address } from "viem";
import { useAccount } from "wagmi";

interface ERC20DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
  tokenAddress: Address;
}

export function ERC20DepositModal({ 
  open, 
  onOpenChange, 
  vaultAddress,
  tokenAddress 
}: ERC20DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const { toast } = useToast();

  const { address: userAddress } = useAccount();
  const { erc20BalanceRaw, refetchHbarBalance } = useUserVaultData(vaultAddress);
  const { 
    decimals, 
    symbol, 
    name,
    balance: userBalance,
    refetchBalance: refetchUserBalance 
  } = useERC20TokenInfo(tokenAddress, userAddress);
  
  const { 
    depositTokens, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error, 
    hash,
    resetTxState,
    refetchBalance 
  } = useERC20Deposit(vaultAddress, tokenAddress);

  // Format balances
  const vaultBalance = formatUnits(erc20BalanceRaw, decimals);
  const walletBalance = formatUnits(userBalance, decimals);

  // Validate amount
  const validation = useMemo(() => {
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

    const maxBalance = parseFloat(walletBalance);
    if (numAmount > maxBalance) {
      return { 
        isValid: false, 
        error: `Amount exceeds wallet balance (${maxBalance} ${symbol})` 
      };
    }

    if (numAmount === maxBalance) {
      return { 
        isValid: true,
        warning: "You're depositing your entire balance. Ensure you have HBAR for gas fees." 
      };
    }

    return { isValid: true };
  }, [amount, showValidation, walletBalance, decimals, symbol]);

  // Show success toast
  useEffect(() => {
    if (isSuccess && hash && amount) {
      toast({
        title: `${symbol} Deposit Successful! ✅`,
        description: (
          <div className="space-y-2">
            <p>
              Successfully deposited {parseFloat(amount).toFixed(Math.min(2, decimals))} {symbol} to your vault.
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
        refetchUserBalance();
        refetchHbarBalance();
      }, 2000);

      setTimeout(() => {
        setAmount("");
        resetTxState();
        setShowValidation(false);
        onOpenChange(false);
      }, 1500);
    }
  }, [isSuccess, hash, amount, symbol, decimals, toast, refetchBalance, refetchUserBalance, refetchHbarBalance, onOpenChange]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Deposit Failed ❌",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">{symbol} deposit could not be completed</p>
            <p className="text-sm opacity-90">
              {error.message || "An error occurred. Please try again."}
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

  // Reset validation when modal opens
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

  const handleMaxClick = () => {
    setAmount(walletBalance);
    setShowValidation(true);
  };

  const handleDeposit = async () => {
    setShowValidation(true);
    
    if (!validation.isValid) {
      return;
    }

    try {
      await depositTokens(amount);
    } catch (err) {
      console.error("Deposit failed:", err);
    }
  };

  const canDeposit = validation.isValid && !isPending && !isConfirming && !isSuccess;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Deposit {symbol || "ERC20"} to Vault
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
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
              <p className="text-sm font-bold">
                {parseFloat(walletBalance).toFixed(Math.min(2, decimals))} {symbol}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Vault Balance</p>
              <p className="text-sm font-bold">
                {parseFloat(vaultBalance).toFixed(Math.min(2, decimals))} {symbol}
              </p>
            </div>
          </div>

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
                Max: {parseFloat(walletBalance).toFixed(Math.min(2, decimals))}
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
                  showValidation && !validation.isValid
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                {symbol}
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Decimals: {decimals} • Min: {(1 / Math.pow(10, decimals)).toFixed(decimals)}</span>
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
                  {parseFloat(amount).toFixed(Math.min(2, decimals))} {symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New vault balance</span>
                <span className="font-medium">
                  {(parseFloat(vaultBalance) + parseFloat(amount)).toFixed(Math.min(2, decimals))} {symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining wallet balance</span>
                <span className="font-medium">
                  {(parseFloat(walletBalance) - parseFloat(amount)).toFixed(Math.min(2, decimals))} {symbol}
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
                Transaction submitted. Confirming on network...
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
                  Deposit {symbol}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}