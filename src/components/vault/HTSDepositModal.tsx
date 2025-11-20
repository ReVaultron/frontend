// components/vault/HTSDepositModal.tsx
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
  Link as LinkIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHTSDeposit } from "@/hooks/useHTSTokenOperations";
import { useTokenBalance, useTokenAssociation } from "@/hooks/useContracts";
import {
  useHTSDepositValidation,
  formatAmountInput,
} from "@/hooks/useBalanceValidation";
import { formatUnits } from "viem";
import type { Address } from "viem";
import { TokenAssociationModal } from "./TokenAssociationModal";
import { ETH_DECIMALS } from "@/lib/constants";

interface HTSDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
  tokenAddress: Address;
  tokenSymbol: string;
  userTokenBalance?: bigint;
}

export function HTSDepositModal({
  open,
  onOpenChange,
  vaultAddress,
  tokenAddress,
  tokenSymbol,
  userTokenBalance,
}: HTSDepositModalProps) {
  const [amount, setAmount] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [showAssociation, setShowAssociation] = useState(false);
  const { toast } = useToast();

  const { isVaultAssociated } = useTokenAssociation(vaultAddress, tokenAddress);
  const { trackedBalance, refetchTracked } = useTokenBalance(vaultAddress, tokenAddress);
  const { validate } = useHTSDepositValidation();
  const {
    depositTokens,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    resetTxState,
    refetchBalance,
  } = useHTSDeposit(vaultAddress, tokenAddress);

  // Check association on mount
  useEffect(() => {
    if (!isVaultAssociated && open) {
      setShowAssociation(true);
    }
  }, [isVaultAssociated, open]);

  // Validate amount
  const validation = useMemo(() => {
    if (!showValidation || !amount) return { isValid: true };
    return validate(amount, userTokenBalance);
  }, [amount, userTokenBalance, showValidation, validate]);

  // Show success toast
  useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: `${tokenSymbol} Deposit Successful! ✅`,
        description: (
          <div className="space-y-2">
            <p>
              Successfully deposited {parseFloat(amount).toFixed(2)} {tokenSymbol} to your vault.
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
        title: "Deposit Failed ❌",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">{tokenSymbol} deposit could not be completed</p>
            <p className="text-sm opacity-90">{error.message}</p>
            {error.message?.includes("not associated") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssociation(true)}
                className="mt-2"
              >
                Associate Token
              </Button>
            )}
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

  const handleMaxClick = () => {
    if (userTokenBalance) {
      const maxAmount = formatUnits(userTokenBalance, ETH_DECIMALS);
      setAmount(maxAmount);
      setShowValidation(true);
    }
  };

  const handleDeposit = async () => {
    setShowValidation(true);

    if (!isVaultAssociated) {
      setShowAssociation(true);
      return;
    }

    const validationResult = validate(amount, userTokenBalance);
    if (!validationResult.isValid) {
      return;
    }

    try {
      await depositTokens(amount);
    } catch (err) {
      console.error("Deposit failed:", err);
    }
  };

  const currentVaultBalance = formatUnits(BigInt(trackedBalance), ETH_DECIMALS);
  const currentUserBalance = userTokenBalance
    ? formatUnits(userTokenBalance, ETH_DECIMALS)
    : "0";

  const canDeposit =
    validation.isValid &&
    isVaultAssociated &&
    !isPending &&
    !isConfirming &&
    !isSuccess;

  return (
    <>
      <TokenAssociationModal
        open={showAssociation}
        onOpenChange={setShowAssociation}
        vaultAddress={vaultAddress}
        tokenAddress={tokenAddress}
        tokenSymbol={tokenSymbol}
      />

      <Dialog open={open && !showAssociation} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit {tokenSymbol} to Vault</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!isVaultAssociated && (
              <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Token not associated with vault</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssociation(true)}
                    className="ml-2"
                  >
                    <LinkIcon className="w-3 h-3 mr-1" />
                    Associate
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
                <p className="text-sm font-bold">
                  {parseFloat(currentUserBalance).toFixed(2)} {tokenSymbol}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Vault Balance</p>
                <p className="text-sm font-bold">
                  {parseFloat(currentVaultBalance).toFixed(2)} {tokenSymbol}
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    HTS Token Information
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Address: <code className="text-xs">{tokenAddress.slice(0, 10)}...{tokenAddress.slice(-8)}</code>
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Status: {isVaultAssociated ? (
                      <span className="text-green-600 font-semibold">✓ Associated</span>
                    ) : (
                      <span className="text-orange-600 font-semibold">⚠ Not Associated</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount">Amount ({tokenSymbol})</Label>
                {userTokenBalance && parseFloat(currentUserBalance) > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleMaxClick}
                    disabled={isPending || isConfirming || !isVaultAssociated}
                    className="h-auto p-0 text-xs"
                  >
                    Max: {parseFloat(currentUserBalance).toFixed(2)}
                  </Button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  disabled={isPending || isConfirming || !isVaultAssociated}
                  className={
                    showValidation && !validation.isValid
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {tokenSymbol}
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Min: 1 • HTS tokens use 8 decimal places</span>
              </div>
            </div>

            {showValidation && validation.error && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{validation.error}</AlertDescription>
              </Alert>
            )}

            {showValidation && validation.warning && validation.isValid && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>{validation.warning}</AlertDescription>
              </Alert>
            )}

            {amount && parseFloat(amount) > 0 && validation.isValid && isVaultAssociated && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Depositing</span>
                  <span className="font-medium">{parseFloat(amount).toFixed(2)} {tokenSymbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New vault balance</span>
                  <span className="font-medium">
                    {(parseFloat(currentVaultBalance) + parseFloat(amount)).toFixed(2)} {tokenSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining wallet balance</span>
                  <span className="font-medium">
                    {Math.max(0, parseFloat(currentUserBalance) - parseFloat(amount)).toFixed(2)} {tokenSymbol}
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
                <AlertDescription>Confirm transaction in your wallet...</AlertDescription>
              </Alert>
            )}

            {isConfirming && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Processing deposit via HTS precompile...
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
                disabled={isPending || isConfirming}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleDeposit} disabled={!canDeposit} className="flex-1">
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isPending ? "Confirm..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Deposit {tokenSymbol}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
