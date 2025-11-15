// components/dashboard/QuickActions.tsx - Enhanced
import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Link as LinkIcon, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HBARDepositModal } from "@/components/vault/HBARDepositModal";
import { HBARWithdrawModal } from "@/components/vault/HBARWithdrawModal";
import { HTSDepositModal } from "@/components/vault/HTSDepositModal";
import { HTSWithdrawModal } from "@/components/vault/HTSWithdrawModal";
import { TokenAssociationModal } from "@/components/vault/TokenAssociationModal";
import type { Address } from "viem";

interface QuickActionsProps {
  vaultAddress?: Address;
  hasVault: boolean;
}

export function QuickActions({ vaultAddress, hasVault }: QuickActionsProps) {
  const [depositHBAROpen, setDepositHBAROpen] = useState(false);
  const [withdrawHBAROpen, setWithdrawHBAROpen] = useState(false);
  const [depositTokenOpen, setDepositTokenOpen] = useState(false);
  const [withdrawTokenOpen, setWithdrawTokenOpen] = useState(false);
  const [associateTokenOpen, setAssociateTokenOpen] = useState(false);

  // Example token - would be selected by user
  const exampleToken = {
    address: "0x0000000000000000000000000000000000000167" as Address,
    symbol: "TEST",
  };

  if (!hasVault) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a vault to access quick actions
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">
              Manage your vault with one-click actions
            </p>
          </div>
          <Button variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Deposit HBAR */}
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => setDepositHBAROpen(true)}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
              <ArrowDownToLine className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-sm font-medium">Deposit HBAR</span>
          </Button>

          {/* Withdraw HBAR */}
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => setWithdrawHBAROpen(true)}
          >
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
              <ArrowUpFromLine className="w-5 h-5 text-green-600 dark:text-green-300" />
            </div>
            <span className="text-sm font-medium">Withdraw HBAR</span>
          </Button>

          {/* Deposit Token */}
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => setDepositTokenOpen(true)}
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-2">
              <ArrowDownToLine className="w-5 h-5 text-purple-600 dark:text-purple-300" />
            </div>
            <span className="text-sm font-medium">Deposit Token</span>
          </Button>

          {/* Withdraw Token */}
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => setWithdrawTokenOpen(true)}
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-2">
              <ArrowUpFromLine className="w-5 h-5 text-orange-600 dark:text-orange-300" />
            </div>
            <span className="text-sm font-medium">Withdraw Token</span>
          </Button>

          {/* Associate Token */}
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => setAssociateTokenOpen(true)}
          >
            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center mb-2">
              <LinkIcon className="w-5 h-5 text-pink-600 dark:text-pink-300" />
            </div>
            <span className="text-sm font-medium">Associate Token</span>
          </Button>
        </div>

        {/* Info Banner */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            💡 <strong>Tip:</strong> Always associate tokens before depositing. Gas fees apply to all operations (~0.05 HBAR).
          </p>
        </div>
      </Card>

      {/* Modals */}
      {vaultAddress && (
        <>
          <HBARDepositModal
            open={depositHBAROpen}
            onOpenChange={setDepositHBAROpen}
            vaultAddress={vaultAddress}
          />

          <HBARWithdrawModal
            open={withdrawHBAROpen}
            onOpenChange={setWithdrawHBAROpen}
            vaultAddress={vaultAddress}
          />

          <HTSDepositModal
            open={depositTokenOpen}
            onOpenChange={setDepositTokenOpen}
            vaultAddress={vaultAddress}
            tokenAddress={exampleToken.address}
            tokenSymbol={exampleToken.symbol}
          />

          <HTSWithdrawModal
            open={withdrawTokenOpen}
            onOpenChange={setWithdrawTokenOpen}
            vaultAddress={vaultAddress}
            tokenAddress={exampleToken.address}
            tokenSymbol={exampleToken.symbol}
          />

          <TokenAssociationModal
            open={associateTokenOpen}
            onOpenChange={setAssociateTokenOpen}
            vaultAddress={vaultAddress}
            tokenAddress={exampleToken.address}
            tokenSymbol={exampleToken.symbol}
          />
        </>
      )}
    </>
  );
}