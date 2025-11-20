// components/vault/VaultCreationFlow.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Wallet } from "lucide-react";
import { useVaultCreation } from "@/hooks/useVaultCreation";
import { formatEther, formatUnits } from "viem";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface VaultCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VaultCreationModal({
  open,
  onOpenChange,
}: VaultCreationModalProps) {
  const { toast } = useToast();
  const {
    initiateCreation,
    creationStep,
    hasVault,
    vaultAddress,
    creationFeeRaw,
    error,
    transactionHash,
  } = useVaultCreation();

  // Show success toast
  useEffect(() => {
    if (creationStep === "success" && transactionHash) {
      toast({
        title: "Vault Created Successfully! 🎉",
        description: (
          <div className="space-y-2">
            <p>Your vault has been created and is ready to use.</p>
            <p className="text-sm font-mono">{vaultAddress}</p>
            <a
              href={`https://hashscan.io/testnet/transaction/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm block"
            >
              View on HashScan ↗
            </a>
          </div>
        ),
        duration: 6000,
      });

      // Auto-close modal after showing toast
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }
  }, [creationStep, transactionHash, vaultAddress, toast, onOpenChange]);

  // Show error toast
  useEffect(() => {
    if (creationStep === "error" && error) {
      toast({
        variant: "destructive",
        title: "Vault Creation Failed ❌",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">Could not create vault</p>
            <p className="text-sm opacity-90">
              {error.message || "Failed to create vault. Please try again."}
            </p>
          </div>
        ),
        duration: 7000,
      });
    }
  }, [creationStep, error, toast]);

  const handleCreate = async () => {
    try {
      await initiateCreation();
    } catch (err) {
      console.error("Vault creation failed:", err);
    }
  };

  if (hasVault) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vault Already Exists</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                You already have a vault at: <code className="font-mono">{vaultAddress}</code>
              </AlertDescription>
            </Alert>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Go to Vault
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
          <DialogTitle>Create Your Vault</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Creation Fee Display */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Creation Fee</span>
              <span className="text-lg font-bold">
                {parseFloat(formatUnits(creationFeeRaw, 8)).toFixed(2)} HBAR
              </span>
            </div>
          </div>

          {/* Status Messages - Only show pending/confirming states */}
          {creationStep === "checking" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Checking requirements...</AlertDescription>
            </Alert>
          )}

          {creationStep === "creating" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Creating vault... Please confirm transaction in your wallet.
              </AlertDescription>
            </Alert>
          )}

          {creationStep === "confirming" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Transaction submitted. Waiting for confirmation...
                {transactionHash && (
                  <a
                    href={`https://hashscan.io/testnet/transaction/${transactionHash}`}
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

          {/* Action Button */}
          {creationStep === "success" ? (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Go to Vault
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={creationStep !== "idle" && creationStep !== "error"}
              className="w-full"
            >
              {creationStep === "idle" || creationStep === "error" ? (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Create Vault
                </>
              ) : (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              )}
            </Button>
          )}

          {/* Important Notes */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• One vault per account</p>
            <p>• You will be the owner of the vault</p>
            <p>• Gas fees will apply (~0.05 HBAR)</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
