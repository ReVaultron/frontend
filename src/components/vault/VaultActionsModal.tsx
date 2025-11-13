// components/vault/VaultActionsModal.tsx
import { useState } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useUserVaultWrite, useTokenAssociation } from "@/hooks/useContracts";
import { useWallet } from "@/hooks/useHederaWallet";

interface VaultActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "deposit" | "withdraw";
  vaultAddress?: `0x${string}`;
}

export function VaultActionsModal({
  isOpen,
  onClose,
  action,
  vaultAddress,
}: VaultActionsModalProps) {
  const [selectedToken, setSelectedToken] = useState<`0x${string}`>(
    "0x0000000000000000000000000000000000000000" as `0x${string}`
  );
  const [amount, setAmount] = useState("");
  const { deposit, withdrawTo, associateToken, isPending, isSuccess, error } = useUserVaultWrite(vaultAddress);
  const { isConnected } = useWallet();
  const { isAssociated } = useTokenAssociation(vaultAddress, selectedToken);
  const [isAssociating, setIsAssociating] = useState(false);

  // Example tokens (HTS addresses on Hedera Testnet)
  const tokens = [
    { address: "0x0000000000000000000000000000000000000000", symbol: "HBAR", balance: "1000", decimals: 8 },
    { address: "0x0000000000000000000000000000000000000001", symbol: "USDC", balance: "5000", decimals: 8 },
  ];

  const handleAssociateToken = async () => {
    if (!isAssociated && selectedToken !== "0x0000000000000000000000000000000000000000") {
      setIsAssociating(true);
      try {
        await associateToken(selectedToken);
        alert("Token associated successfully! Now you can deposit.");
      } catch (err) {
        console.error("Association failed:", err);
      } finally {
        setIsAssociating(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    // Check token association for deposits
    if (action === "deposit" && !isAssociated && selectedToken !== "0x0000000000000000000000000000000000000000") {
      alert("Please associate this token with your vault first");
      return;
    }

    try {
      // Convert to int64 format (8 decimals for HTS)
      const amountInt64 = BigInt(Math.floor(parseFloat(amount) * 1e8));

      if (action === "deposit") {
        await deposit(selectedToken, amountInt64);
      } else {
        if (!evmAddress) {
          alert("Connected address not found");
          return;
        }
        await withdrawTo(selectedToken, amountInt64, evmAddress as `0x${string}`);
      }
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground capitalize">{action} to Vault</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Token Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Token
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value as `0x${string}`)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} (Balance: {token.balance})
                </option>
              ))}
            </select>
          </div>

          {/* Association Warning for Deposits */}
          {action === "deposit" && !isAssociated && selectedToken !== "0x0000000000000000000000000000000000000000" && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Token Not Associated
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  You must associate this token with your vault before depositing.
                </p>
                <button
                  type="button"
                  onClick={handleAssociateToken}
                  disabled={isAssociating}
                  className="mt-2 text-xs px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  {isAssociating ? "Associating..." : "Associate Token"}
                </button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <button
                type="button"
                onClick={() => {
                  const token = tokens.find((t) => t.address === selectedToken);
                  if (token) setAmount(token.balance);
                }}
                className="text-xs text-primary hover:text-primary/80"
              >
                Use Max
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.00000001"
                min="0"
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {tokens.find((t) => t.address === selectedToken)?.symbol}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Amount in token units (8 decimals for HTS)
            </p>
          </div>

          {/* Transaction Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">You will {action}</span>
                <span className="font-semibold text-foreground">
                  {amount} {tokens.find((t) => t.address === selectedToken)?.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-semibold text-foreground">~0.001 HBAR</span>
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

          {/* Success Message */}
          {isSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Transaction Successful
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Your {action} has been processed successfully.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isPending || 
                !isConnected || 
                !amount || 
                parseFloat(amount) <= 0 ||
                (action === "deposit" && !isAssociated && selectedToken !== "0x0000000000000000000000000000000000000000")
              }
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}