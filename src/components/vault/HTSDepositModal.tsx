// components/vault/HTSDepositModal.tsx - Enhanced Version
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowDownToLine, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Link as LinkIcon 
} from "lucide-react";
import { useHTSDeposit } from "@/hooks/useHTSTokenOperations";
import { useTokenBalance, useTokenAssociation } from "@/hooks/useContracts";
import { useHTSDepositValidation, formatAmountInput } from "@/hooks/useBalanceValidation";
import { formatUnits } from "viem";
import type { Address } from "viem";
import { TokenAssociationModal } from "./TokenAssociationModal";

const HTS_DECIMALS = 8;

interface HTSDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
  tokenAddress: Address;
  tokenSymbol: string;
  userTokenBalance?: bigint; // User's wallet token balance
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

  const { isVaultAssociated } = useTokenAssociation(vaultAddress, tokenAddress);
  const { trackedBalance, refetchTracked } = useTokenBalance(vaultAddress, tokenAddress);
  const { validate } = useHTSDepositValidation(vaultAddress, tokenAddress);
  const {
    depositTokens,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
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

  // Refetch balance after success
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        refetchBalance();
      }, 2000);
    }
  }, [isSuccess, refetchBalance]);

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
    const formatted = formatAmountInput(value, HTS_DECIMALS);
    setAmount(formatted);
    setShowValidation(true);
  };

  const handleMaxClick = () => {
    if (userTokenBalance) {
      const maxAmount = formatUnits(userTokenBalance, HTS_DECIMALS);
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

  const currentVaultBalance = formatUnits(BigInt(trackedBalance), HTS_DECIMALS);
  const currentUserBalance = userTokenBalance 
    ? formatUnits(userTokenBalance, HTS_DECIMALS)
    : "0";

  const canDeposit = validation.isValid && 
    isVaultAssociated && 
    !isPending && 
    !isConfirming && 
    !isSuccess;

  return (
    <>
      {/* Association Modal */}
      <TokenAssociationModal
        open={showAssociation}
        onOpenChange={setShowAssociation}
        vaultAddress={vaultAddress}
        tokenAddress={tokenAddress}
        tokenSymbol={tokenSymbol}
      />

      {/* Deposit Modal */}
      <Dialog open={open && !showAssociation} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit {tokenSymbol} to Vault</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Association Warning */}
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

            {/* Balance Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
                <p className="text-sm font-bold">
                  {parseFloat(currentUserBalance).toFixed(8)} {tokenSymbol}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Vault Balance</p>
                <p className="text-sm font-bold">
                  {parseFloat(currentVaultBalance).toFixed(8)} {tokenSymbol}
                </p>
              </div>
            </div>

            {/* Token Info */}
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
                    Status: {isVaultAssociated ? 
                      <span className="text-green-600 font-semibold">✓ Associated</span> : 
                      <span className="text-orange-600 font-semibold">⚠ Not Associated</span>
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Input */}
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
                    Max: {parseFloat(currentUserBalance).toFixed(8)}
                  </Button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00000000"
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
                <span>Min: 0.00000001 • HTS tokens use 8 decimal places</span>
              </div>
            </div>

            {/* Validation Messages */}
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

            {/* Transaction Summary */}
            {amount && parseFloat(amount) > 0 && validation.isValid && isVaultAssociated && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Depositing</span>
                  <span className="font-medium">{parseFloat(amount).toFixed(8)} {tokenSymbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New vault balance</span>
                  <span className="font-medium">
                    {(parseFloat(currentVaultBalance) + parseFloat(amount)).toFixed(8)} {tokenSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining wallet balance</span>
                  <span className="font-medium">
                    {Math.max(0, parseFloat(currentUserBalance) - parseFloat(amount)).toFixed(8)} {tokenSymbol}
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
                  Confirm transaction in your wallet...
                </AlertDescription>
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

            {isSuccess && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Deposit successful! Tokens transferred to vault.
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
                  <p className="font-semibold">Deposit Failed</p>
                  <p className="text-xs mt-1">{error.message}</p>
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

// components/vault/HTSWithdrawModal.tsx - Enhanced Version
import { useAccount } from "wagmi";
import { useHTSWithdraw } from "@/hooks/useHTSTokenOperations";
import { useHTSWithdrawValidation, useRecipientValidation } from "@/hooks/useBalanceValidation";
import { ArrowUpFromLine } from "lucide-react";

