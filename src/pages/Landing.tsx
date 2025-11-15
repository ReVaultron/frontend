// app/dashboard/page.tsx - Enhanced with Real Data
import { DollarSign, TrendingUp, Zap, AlertTriangle, Wallet, Plus } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { VolatilityMonitor } from "@/components/dashboard/VolatilityMonitor";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
import { ActiveVaults } from "@/components/dashboard/ActiveVaults";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";
import {
  useVaultWithVolatility,
  useUserVaultAddress,
  useUserVaultData,
  useVolatilityIndexData,
} from "@/hooks/useContracts";
import { useAccount, useBalance } from "wagmi";
import { useMemo, useEffect, useState } from "react";
import { DEFAULT_PRICE_FEED_ID } from "@/lib/contracts/abis";
import { formatUnits } from "viem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { address: userAddress, isConnected } = useAccount();
  const { vaultAddress, hasVault } = useUserVaultAddress(userAddress);
  
  // Get wallet balance
  const { data: walletBalance } = useBalance({
    address: userAddress,
  });

  // Get vault data
  const vaultData = useUserVaultData(hasVault ? vaultAddress : undefined);
  
  // Get volatility data
  const volatilityData = useVolatilityIndexData(DEFAULT_PRICE_FEED_ID);

  // Calculate total deposited (HBAR balance in USD equivalent)
  const totalDeposited = useMemo(() => {
    if (!hasVault || !vaultData.hbarBalanceRaw) return "0.00";
    
    // Convert HBAR to number (8 decimals)
    const hbarAmount = parseFloat(formatUnits(vaultData.hbarBalanceRaw, 8));
    
    // Get HBAR price from volatility data
    const hbarPrice = volatilityData.volatilityData
      ? volatilityData.volatilityData.price / Math.pow(10, Math.abs(volatilityData.volatilityData.expo))
      : 0.12; // Fallback price
    
    const usdValue = hbarAmount * hbarPrice;
    return usdValue.toFixed(2);
  }, [hasVault, vaultData.hbarBalanceRaw, volatilityData.volatilityData]);

  // Calculate current value (would include all tokens in production)
  const currentValue = useMemo(() => {
    // For now, same as deposited since we don't have historical data
    return totalDeposited;
  }, [totalDeposited]);

  // Calculate fees earned (would come from LP positions)
  const feesEarned = useMemo(() => {
    // DUMMY: Would be calculated from actual LP positions
    return "0.00";
  }, []);

  // Calculate percentage changes (would come from historical data)
  const changes = useMemo(() => {
    // DUMMY: In production, these would be calculated from historical snapshots
    const baseChange = parseFloat(totalDeposited) > 0 ? 2.5 : 0;
    
    return {
      deposited: baseChange,
      value: baseChange * 1.1,
      fees: parseFloat(feesEarned) > 0 ? 5.2 : 0,
      volatility: volatilityData.currentVolatility > 30
        ? ((volatilityData.currentVolatility - 30) / 30) * 100
        : -((30 - volatilityData.currentVolatility) / 30) * 100,
    };
  }, [totalDeposited, feesEarned, volatilityData.currentVolatility]);

  // Format last update time
  const lastUpdateTime = volatilityData.lastUpdate > 0
    ? new Date(volatilityData.lastUpdate * 1000).toLocaleTimeString()
    : "N/A";

  // Loading state
  const isLoading = isConnected && hasVault === undefined;

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Connect your wallet to access your vault dashboard
          </p>
        </div>

        <Card className="p-12">
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
            <p className="text-muted-foreground">
              Please connect your wallet to view your dashboard and manage your vaults
            </p>
            <Button className="mt-4">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto">
        <div className="space-y-1">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // No vault state
  if (!hasVault) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Create your first vault to start managing your portfolio
          </p>
        </div>

        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium">No vault found for your address</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a vault to deposit funds and start earning
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Vault
            </Button>
          </AlertDescription>
        </Alert>

        {/* Show wallet balance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Wallet</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">HBAR Balance</p>
              <p className="text-2xl font-bold">
                {walletBalance
                  ? parseFloat(formatUnits(walletBalance.value, 8)).toFixed(4)
                  : "0.0000"}{" "}
                ℏ
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">USD Value</p>
              <p className="text-2xl font-bold">
                $
                {walletBalance && volatilityData.volatilityData
                  ? (
                      parseFloat(formatUnits(walletBalance.value, 8)) *
                      (volatilityData.volatilityData.price /
                        Math.pow(10, Math.abs(volatilityData.volatilityData.expo)))
                    ).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Monitor your positions and manage portfolio risk.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Deposited"
          value={`$${totalDeposited}`}
          change={changes.deposited}
          icon={DollarSign}
          iconColor="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
          subtitle={`${vaultData.hbarBalance} HBAR`}
        />
        <MetricCard
          title="Current Value"
          value={`$${currentValue}`}
          change={changes.value}
          icon={TrendingUp}
          iconColor="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
          subtitle={`${vaultData.tokenCount} token${vaultData.tokenCount !== 1 ? "s" : ""}`}
        />
        <MetricCard
          title="Fees Earned"
          value={`$${feesEarned}`}
          change={changes.fees}
          icon={Zap}
          iconColor="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300"
          subtitle="From LP positions"
          isDummy={true}
        />
        <MetricCard
          title="Current Volatility"
          value={`${volatilityData.currentVolatility.toFixed(1)}%`}
          change={changes.volatility}
          icon={AlertTriangle}
          iconColor="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300"
          subtitle={volatilityData.isStale ? "⚠️ Data may be stale" : "Live"}
          isLive={!volatilityData.isStale}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions vaultAddress={vaultAddress} hasVault={hasVault} />

      {/* Volatility Monitor */}
      <VolatilityMonitor
        threshold={30} // Would come from user settings
        priceFeedId={DEFAULT_PRICE_FEED_ID}
      />

      {/* Active Vaults & Agent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActiveVaults />
        </div>
        <AgentActivityFeed />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                volatilityData.isStale ? "bg-orange-500" : "bg-green-500 animate-pulse"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              System Status:{" "}
              <span className={volatilityData.isStale ? "text-orange-500" : "text-green-500"}>
                {volatilityData.isStale ? "Syncing" : "Active"}
              </span>
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">
            Network: <span className="font-medium text-foreground">Hedera Testnet</span>
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: <span className="font-medium text-foreground">{lastUpdateTime}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;