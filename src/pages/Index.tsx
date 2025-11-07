import { DollarSign, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { VolatilityMonitor } from "@/components/dashboard/VolatilityMonitor";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
import { ActiveVaults } from "@/components/dashboard/ActiveVaults";
import { WalletConnect } from "@/components/WalletConnect";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Monitor your autonomous portfolio performance</p>
              </div>
            </div>
            <WalletConnect />
          </header>

          <div className="flex-1 p-6 space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Deposited"
                value="$125.0K"
                change={12.5}
                icon={DollarSign}
                iconColor="bg-primary/10 text-primary"
              />
              <MetricCard
                title="Current Value"
                value="$128.5K"
                change={2.8}
                icon={TrendingUp}
                iconColor="bg-success/10 text-success"
              />
              <MetricCard
                title="Fees Earned"
                value="$4.2K"
                change={8.4}
                icon={Zap}
                iconColor="bg-success/10 text-success"
              />
              <MetricCard
                title="Current Volatility"
                value="3.2%"
                change={1.1}
                icon={AlertTriangle}
                iconColor="bg-warning/10 text-warning"
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

            {/* Active Vaults */}
            <ActiveVaults />

            {/* Footer Info */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-muted-foreground">System Status: <span className="text-success font-medium">Active</span></span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-sm text-muted-foreground">Network: <span className="font-medium text-foreground">Hedera Testnet</span></span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
