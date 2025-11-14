import { DollarSign, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { VolatilityMonitor } from "@/components/dashboard/VolatilityMonitor";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
import { ActiveVaults } from "@/components/dashboard/ActiveVaults";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";
import {
  useVaultWithVolatility,
  useUserVaultAddress,
} from "@/hooks/useContracts";
import { useAccount } from "wagmi";
import { useMemo, useEffect, useState } from "react";
// import { getAccountBalance } from "@/hooks/useTokenBalances";
import { ethers } from "ethers";

const Dashboard = () => {
  const { address: userAddress, isConnected } = useAccount();
  const { vaultAddress, hasVault } = useUserVaultAddress(userAddress);
  const [bal, setBal] = useState<string | null>(null);

  const vaultData = useVaultWithVolatility(
    hasVault ? vaultAddress : undefined,
    undefined,
    30 // Default 30% threshold
  );

  // Calculate change percentages based on historical data
  // NOTE: These would come from historical tracking in production
  const changes = useMemo(
    () => ({
      deposited: 12.5, // DUMMY: Would need historical deposit tracking
      value: parseFloat(vaultData.hbarBalance) > 0 ? 2.8 : 0, // DUMMY: Needs historical value tracking
      fees: 8.4, // DUMMY: Would come from LP fee tracking
      volatility:
        vaultData.currentVolatility > vaultData.volatilityThreshold
          ? ((vaultData.currentVolatility - vaultData.volatilityThreshold) /
              vaultData.volatilityThreshold) *
            100
          : -(
              ((vaultData.volatilityThreshold - vaultData.currentVolatility) /
                vaultData.volatilityThreshold) *
              100
            ),
    }),
    [vaultData]
  );

  // Format last update time
  const lastUpdateTime =
    vaultData.lastUpdate > 0
      ? new Date(vaultData.lastUpdate * 1000).toLocaleTimeString()
      : "N/A";

  // Fetch ERC20 balance
  useEffect(() => {
    const fetchBalance = async () => {
      // const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
      // const token = "0xfB42019AA3231Db94881529CDe0D500f2D3d1272"; // USDC
      // const user = "0x69e213da99117e66970584f6e81673ad1483b8e6";
      
      const userBalanceBefore = await ethers.provider.getBalance(userAddress);
      console.log('userBalanceBefore', ethers.formatEther(userBalanceBefore));
      // const balance = await getAccountBalance(userAddress);
      // console.log('balance', balance)
      // setBal(balance);
      // console.log(balance);
    };

    fetchBalance();
  }, []);

  console.log('bal', bal)
  return (
    <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          {hasVault
            ? "Welcome back! Monitor your positions and manage portfolio risk."
            : "Connect your wallet and create a vault to get started."}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Deposited"
          value={hasVault ? `$${vaultData.totalValue}` : "$0.00"}
          change={changes.deposited}
          icon={DollarSign}
          iconColor="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
        />
        <MetricCard
          title="Current Value"
          value={hasVault ? `$${vaultData.totalValue}` : "$0.00"}
          change={changes.value}
          icon={TrendingUp}
          iconColor="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
        />
        <MetricCard
          title="Fees Earned"
          value="$0.00" // DUMMY: Would come from LP tracking
          change={changes.fees}
          icon={Zap}
          iconColor="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300"
        />
        <MetricCard
          title="Current Volatility"
          value={`${vaultData.currentVolatility.toFixed(1)}%`}
          change={changes.volatility}
          icon={AlertTriangle}
          iconColor="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions vaultAddress={hasVault ? vaultAddress : undefined} />

      {/* Volatility Monitor & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolatilityMonitor
            threshold={vaultData.volatilityThreshold}
            currentVolatility={vaultData.currentVolatility}
            isStale={vaultData.isStale}
          />
        </div>
        <PerformanceCard />
      </div>

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
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              System Status:{" "}
              <span className="text-green-500 font-medium">Active</span>
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">
            Network:{" "}
            <span className="font-medium text-foreground">Hedera Testnet</span>
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated:{" "}
          <span className="font-medium text-foreground">{lastUpdateTime}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
