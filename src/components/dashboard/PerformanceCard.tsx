// components/dashboard/PerformanceCard.tsx
import { TrendingUp } from "lucide-react";
import { useUserVaultData, useUserVaultEvents } from "@/hooks/useContracts";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/abis";
import { useMemo } from "react";

export function PerformanceCard() {
  const vaultData = useUserVaultData(CONTRACT_ADDRESSES.USER_VAULT);
  const { tokenReceived, tokenWithdrawn } = useUserVaultEvents(CONTRACT_ADDRESSES.USER_VAULT);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalDeposited = tokenReceived.reduce((sum, deposit) => {
      const amount = deposit.args?.amount || BigInt(0);
      return sum + Number(amount);
    }, 0);

    const totalWithdrawn = tokenWithdrawn.reduce((sum, withdrawal) => {
      const amount = withdrawal.args?.amount || BigInt(0);
      return sum + Number(amount);
    }, 0);

    const currentValue = parseFloat(vaultData.totalValue);
    const netDeposits = (totalDeposited - totalWithdrawn) / 1e8; // Convert from int64
    const pnl = currentValue - netDeposits;
    const pnlPercent = netDeposits > 0 ? (pnl / netDeposits) * 100 : 0;

    // Estimated fees (would need actual calculation)
    const feesEarned = currentValue * 0.005; // 0.5% estimate

    return {
      pnl,
      pnlPercent,
      feesEarned,
      depositCount: tokenReceived.length,
      withdrawCount: tokenWithdrawn.length,
    };
  }, [tokenReceived, tokenWithdrawn, vaultData.totalValue]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-foreground">Performance</h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1">Current P&L</p>
        <h2 className={`text-3xl font-bold ${metrics.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {metrics.pnl >= 0 ? "+" : ""}${Math.abs(metrics.pnl).toFixed(2)}
        </h2>
        <p className={`text-sm ${metrics.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {metrics.pnlPercent >= 0 ? "+" : ""}
          {metrics.pnlPercent.toFixed(2)}% return
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-blue-700">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Est. Fees</p>
          <p className="text-lg font-semibold text-green-600">
            ${metrics.feesEarned.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">HBAR Balance</p>
          <p className="text-lg font-semibold text-foreground">
            {vaultData.hbarBalance} ℏ
          </p>
        </div>
      </div>

      {(metrics.depositCount > 0 || metrics.withdrawCount > 0) && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deposits</span>
            <span className="font-semibold text-foreground">{metrics.depositCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Withdrawals</span>
            <span className="font-semibold text-foreground">{metrics.withdrawCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}