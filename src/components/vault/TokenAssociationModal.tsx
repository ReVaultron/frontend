
// components/vault/TokenAssociationModal.tsx
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useTokenAssociationOperations } from "@/hooks/useHTSTokenOperations";
import { Address } from "viem";

interface TokenAssociationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultAddress: Address;
  tokenAddress: Address;
  tokenSymbol: string;
}

export function TokenAssociationModal({
  open,
  onOpenChange,
  vaultAddress,
  tokenAddress,
  tokenSymbol,
}: TokenAssociationModalProps) {
  const {
    associate,
    isVaultAssociated,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  } = useTokenAssociationOperations(vaultAddress, tokenAddress);

  // Close after success
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        onOpenChange(false);
      }, 3000);
    }
  }, [isSuccess, onOpenChange]);

  const handleAssociate = async () => {
    try {
      await associate();
    } catch (err) {
      console.error("Association failed:", err);
    }
  };

  if (isVaultAssociated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Token Already Associated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-green-500">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                {tokenSymbol} is already associated with your vault.
              </AlertDescription>
            </Alert>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Associate {tokenSymbol} with Vault</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Message */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Before depositing HTS tokens, you must associate them with your vault. 
              This is a one-time operation that calls the HTS precompile at 0x167.
            </AlertDescription>
          </Alert>

          {/* Token Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Token</span>
              <span className="font-medium">{tokenSymbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Address</span>
              <code className="text-xs font-mono">
                {tokenAddress.slice(0, 10)}...{tokenAddress.slice(-8)}
              </code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-orange-600">Not Associated</span>
            </div>
          </div>

          {/* Status Messages */}
          {isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Please confirm the association in your wallet...
              </AlertDescription>
            </Alert>
          )}

          {isConfirming && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Associating token with vault...
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
            <Alert className="border-green-500">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Token associated successfully! You can now deposit {tokenSymbol}.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                {error.message || "Association failed. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {/* Important Notes */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• One-time operation per token</p>
            <p>• Gas fee: ~0.05 HBAR</p>
            <p>• Required before any token transfers</p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleAssociate}
            disabled={isPending || isConfirming || isSuccess}
            className="w-full"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isPending ? "Confirm in Wallet..." : "Associating..."}
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Associated!
              </>
            ) : (
              "Associate Token"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
