import { DollarSign, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { VolatilityMonitor } from "@/components/dashboard/VolatilityMonitor";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
import { ActiveVaults } from "@/components/dashboard/ActiveVaults";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";

const Dashboard = () => {
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
          value="$125.0K"
          change={12.5}
          icon={DollarSign}
          iconColor="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
        />
        <MetricCard
          title="Current Value"
          value="$128.5K"
          change={2.8}
          icon={TrendingUp}
          iconColor="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
        />
        <MetricCard
          title="Fees Earned"
          value="$4.2K"
          change={8.4}
          icon={Zap}
          iconColor="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300"
        />
        <MetricCard
          title="Current Volatility"
          value="3.2%"
          change={1.1}
          icon={AlertTriangle}
          iconColor="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Volatility Monitor & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolatilityMonitor threshold={5.0} />
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
          Last updated: <span className="font-medium text-foreground">2 min ago</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;