// components/vault/VaultCreationFlow.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Wallet } from "lucide-react";
import { useVaultCreation } from "@/hooks/useVaultCreation";
import { formatEther } from "viem";

export function VaultCreationFlow({ onComplete }: { onComplete?: () => void }) {
  const {
    initiateCreation,
    creationStep,
    hasVault,
    vaultAddress,
    creationFeeRaw,
    error,
    transactionHash,
  } = useVaultCreation();

  const handleCreate = async () => {
    try {
      await initiateCreation();
    } catch (err) {
      console.error("Vault creation failed:", err);
    }
  };

  // If user already has a vault
  if (hasVault) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vault Already Exists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              You already have a vault at: <code className="font-mono">{vaultAddress}</code>
            </AlertDescription>
          </Alert>
          <Button onClick={onComplete} className="w-full">
            Go to Vault
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Vault</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Creation Fee Display */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Creation Fee</span>
            <span className="text-lg font-bold">
              {formatEther(creationFeeRaw)} HBAR
            </span>
          </div>
        </div>

        {/* Status Messages */}
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

        {creationStep === "success" && (
          <Alert className="border-green-500">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Vault created successfully!
              {transactionHash && (
                <a
                  href={`https://hashscan.io/testnet/transaction/${transactionHash}`}
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

        {creationStep === "error" && (
          <Alert className="border-red-500">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              {error?.message || "Failed to create vault. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        {creationStep === "success" ? (
          <Button onClick={onComplete} className="w-full">
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
      </CardContent>
    </Card>
  );
}