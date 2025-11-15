// components/dashboard/QuickActions.tsx
import { useState } from "react";
import {
  useVolatilityIndexData,
  useUserVaultData,
  useUserVaultAddress,
} from "@/hooks/useContracts";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/abis";
import { DepositModal } from "../vault/DepositModal";
import { useAccount } from "wagmi";
import { HBARDepositModal } from "../vault/HBARDepositModal";
import { HBARWithdrawModal } from "../vault/HBARWithdrawModal";
import { VaultCreationFlow } from "../vault/VaultCreationFlow";
import { HTSWithdrawModal } from "../vault/HTSWithdrawModal";
import { HTSDepositModal } from "../vault/HTSDepositModal";

export function QuickActions() {
  const { address: userAddress, isConnected } = useAccount();
  const { vaultAddress, hasVault } = useUserVaultAddress(userAddress);
  const [depositHBAROpen, setDepositHBAROpen] = useState(false);
  const [withdrawHBAROpen, setWithdrawHBAROpen] = useState(false);
  const [depositTokenOpen, setDepositTokenOpen] = useState(false);
  const [withdrawTokenOpen, setWithdrawTokenOpen] = useState(false);
  const { refetchVolatility } = useVolatilityIndexData();
  const vaultData = useUserVaultData(vaultAddress);
  const needsRebalancing = false; // TODO: Implement rebalancing logic

  console.log("vaultData", vaultData);
  const actions = [
    // {
    //   label: "Create Vault",
    //   primary: false,
    //   onClick: () => console.log("Create Vault clicked"),
    // },
    {
      label: "+ Deposit",
      primary: true,
      onClick: () => setDepositHBAROpen(true),
    },
    {
      label: "Withdraw",
      primary: false,
      onClick: () => setWithdrawHBAROpen(true),
    },
    {
      label: "Harvest Fees",
      primary: false,
      onClick: () => console.log("Harvest Fees clicked"),
      disabled: true, // TODO: Implement
    },
    {
      label: needsRebalancing ? "🔄 Rebalance Now" : "Check IL Risk",
      primary: false,
      onClick: () => refetchVolatility(),
      badge: needsRebalancing ? "Action Required" : undefined,
    },
  ];

  // if (!hasVault) {
  //   return <VaultCreationFlow onComplete={() => window.location.reload()} />;
  // }

  return (
    <>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`relative ${
                action.primary
                  ? "px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30"
                  : "px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-all"
              } ${action.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {action.label}
              {action.badge && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <HBARDepositModal
        open={depositHBAROpen}
        onOpenChange={setDepositHBAROpen}
        vaultAddress={vaultAddress!}
      />

      <HBARWithdrawModal
        open={withdrawHBAROpen}
        onOpenChange={setWithdrawHBAROpen}
        vaultAddress={vaultAddress!}
      />

      <HTSDepositModal
        open={depositTokenOpen}
        onOpenChange={setDepositTokenOpen}
        vaultAddress={vaultAddress!}
        tokenAddress="0x546268afB164e72C7e0bf6262b0A406860d93F47"
        tokenSymbol="TEST"
      />

      <HTSWithdrawModal
        open={withdrawTokenOpen}
        onOpenChange={setWithdrawTokenOpen}
        vaultAddress={vaultAddress!}
        tokenAddress="0x546268afB164e72C7e0bf6262b0A406860d93F47"
        tokenSymbol="TEST"
      />
    </>
  );
}
