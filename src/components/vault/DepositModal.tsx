// components/vault/DepositModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import {
  ArrowDownToLine,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  useUserVaultWrite,
  useTokenBalance,
  useTokenAssociation,
} from "@/hooks/useContracts";
import { toInt64 } from "@/hooks/useContracts";
import { parseUnits } from "viem";
import type { Address } from "viem";
import { ethers } from "ethers";
import { fetchERC20Balance, fetchHBARBalance } from "@/hooks/useTokenBalances";
import { useWallet } from "@/hooks/useHederaWallet";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
  vaultName: string;
}

// HTS tokens typically use 8 decimals
const TOKEN_DECIMALS = 8;

export function DepositModal({
  open,
  onOpenChange,
  vaultAddress,
  vaultName,
}: DepositModalProps) {
  const { deposit, associateToken, isPending, isSuccess, error } =
    useUserVaultWrite(vaultAddress);

  const { isConnected, address: evmAddress } = useWallet();
  const [isAssociating, setIsAssociating] = useState(false);

  const [selectedToken, setSelectedToken] = useState<`0x${string}`>(
    "0x0000000000000000000000000000000000342855"
  );
  const [amount, setAmount] = useState("");

  const { isVaultAssociated } = useTokenAssociation(
    vaultAddress,
    selectedToken
  );

  // 🔹 Dynamic tokens with live balances
  const [tokens, setTokens] = useState<
    {
      address: `0x${string}`;
      symbol: string;
      balance: string;
      decimals: number;
    }[]
  >([
    {
      address: "0x0000000000000000000000000000000000342855",
      symbol: "HBAR",
      balance: "0",
      decimals: 8,
    },
    {
      address: "0x0000000000000000000000000000000000068cDa",
      symbol: "USDC",
      balance: "0",
      decimals: 6,
    },
  ]);

  // ---------------------------
  // 🔹 Load Live Balances
  // ---------------------------
  useEffect(() => {
    const loadBalances = async () => {
      if (!evmAddress) return;

      const updated = await Promise.all(
        tokens.map(async (token) => {
          try {
            let bal = "0";

            if (token.symbol === "HBAR") {
              bal = await fetchHBARBalance(evmAddress);
            } else {
              bal = await fetchERC20Balance(token.address, evmAddress);
            }

            return { ...token, balance: bal };
          } catch (err) {
            console.error("Failed to fetch balance:", token.symbol, err);
            return { ...token, balance: "0" };
          }
        })
      );

      setTokens(updated);
    };

    loadBalances();
  }, [evmAddress, isConnected]);

  // ---------------------------
  // 🔹 Token Association
  // ---------------------------
  const handleAssociateToken = async () => {
    if (!isVaultAssociated) {
      setIsAssociating(true);
      try {
        const associate = await associateToken(selectedToken);
        console.log("associate", associate);
        alert("Token associated successfully!");
      } catch (err) {
        console.error("Association failed:", err);
      } finally {
        setIsAssociating(false);
      }
    }
  };

  // ---------------------------
  // 🔹 Submit Transaction
  // ---------------------------
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (!isVaultAssociated) {
      alert("Please associate token first");
      return;
    }

    try {
      const token = tokens.find((t) => t.address === selectedToken);
      if (!token) return;

      const amountInt = ethers.parseUnits(amount, token.decimals);

      const depositResult = await deposit(selectedToken, amountInt);
      console.log("Deposit result:", depositResult);
    } catch (err) {
      console.error("Transaction error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit to Vault</DialogTitle>
          <DialogDescription>Deposit tokens to {vaultName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Token Association Warning */}
          {!isVaultAssociated && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Token Not Associated
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Associate this token with your vault before depositing.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAssociateToken}
                  disabled={isAssociating}
                  className="mt-2"
                >
                  {isAssociating ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Associating...
                    </>
                  ) : (
                    "Associate Token"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Token Selection - Simplified for now */}
          <div className="space-y-2">
            <Label>Token</Label>
            <p className="text-sm text-muted-foreground">HBAR</p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step={`0.${"0".repeat(TOKEN_DECIMALS - 1)}1`}
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Amount in token units ({TOKEN_DECIMALS} decimals)
            </p>
          </div>

          {/* Transaction Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You will deposit</span>
                <span className="font-medium">{amount} HBAR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network fee</span>
                <span className="font-medium">~0.05 HBAR</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Deposit Successful
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Your deposit has been processed.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Transaction Failed
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {error.message || "An error occurred. Please try again."}
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleDeposit}
            disabled={
              isPending ||
              !amount ||
              parseFloat(amount) <= 0 ||
              !isVaultAssociated
            }
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Deposit HBAR
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
