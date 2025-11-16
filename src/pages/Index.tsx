// app/dashboard/page.tsx - Updated with Pyth Prices
import {
  DollarSign,
  TrendingUp,
  Zap,
  AlertTriangle,
  Wallet,
  Plus,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { VolatilityMonitor } from "@/components/dashboard/VolatilityMonitor";
import { ActiveVaults } from "@/components/dashboard/ActiveVaults";
import { AgentActivityFeed } from "@/components/agents/AgentActivityFeed";
import { useUserVaultAddress, useUserVaultData } from "@/hooks/useContracts";
import { usePythPrice, usePythPrices } from "@/hooks/usePythPrices";
import { PYTH_PRICE_FEEDS } from "@/lib/pyth/price-feeds";
import { useAccount, useBalance } from "wagmi";
import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { VaultCreationModal } from "@/components/vault/VaultCreationFlow";

const Dashboard = () => {
  const { address: userAddress, isConnected } = useAccount();
  const { vaultAddress, hasVault } = useUserVaultAddress(userAddress);
  const [createVaultOpen, setCreateVaultOpen] = useState(false);
  console.log("createVaultOpen", createVaultOpen);
  // Get wallet balance
  const { data: walletBalance } = useBalance({
    address: userAddress,
  });

  console.log("hasVault", hasVault);

  // Get vault data
  const vaultData = useUserVaultData(hasVault ? vaultAddress : undefined);

  // Get HBAR price from Pyth
  const {
    price: hbarPrice,
    isLoading: priceLoading,
    error: priceError,
    lastUpdate: priceLastUpdate,
  } = usePythPrice({
    priceFeedId: PYTH_PRICE_FEEDS.HBAR_USD,
    refreshInterval: 60000, // Update every 60 seconds
  });

  console.log("priceLoading", priceLoading);
  console.log("vaultData", vaultData);
  // Calculate total deposited in USD
  const totalDeposited = useMemo(() => {
    if (!hasVault || !vaultData.hbarBalanceRaw || !hbarPrice) return "0.00";

    const hbarAmount = parseFloat(formatUnits(vaultData.hbarBalanceRaw, 8));
    const usdValue = hbarAmount * hbarPrice.priceUSD;

    return usdValue.toFixed(2);
  }, [hasVault, vaultData.hbarBalanceRaw, hbarPrice]);

  // Calculate wallet value in USD
  const walletValueUSD = useMemo(() => {
    if (!walletBalance || !hbarPrice) return "0.00";

    const hbarAmount = parseFloat(formatUnits(walletBalance.value, 18));
    const usdValue = hbarAmount * hbarPrice.priceUSD;

    return usdValue.toFixed(2);
  }, [walletBalance, hbarPrice]);

  // Calculate current value (same as deposited for now)
  const currentValue = totalDeposited;

  // Calculate fees earned (dummy for now)
  const feesEarned = "0.00";

  // Calculate percentage changes (dummy - would come from historical data)
  const changes = useMemo(() => {
    const baseChange = parseFloat(totalDeposited) > 0 ? 2.5 : 0;

    return {
      deposited: baseChange,
      value: baseChange * 1.1,
      fees: parseFloat(feesEarned) > 0 ? 5.2 : 0,
      volatility: 0, // Would come from VolatilityIndex
    };
  }, [totalDeposited, feesEarned]);

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
              Please connect your wallet to view your dashboard and manage your
              vaults
            </p>
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

  // Price error state
  if (priceError) {
    return (
      <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto">
        <Alert variant="destructive">
          <AlertDescription>
            Unable to fetch price data. Please refresh the page or try again
            later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No vault state
  if (!hasVault) {
    return (
      <>
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
              <Button onClick={() => setCreateVaultOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Vault
              </Button>
            </AlertDescription>
          </Alert>

          {/* Show wallet balance with Pyth price */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Wallet</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  HBAR Balance
                </p>
                <p className="text-2xl font-bold">
                  {walletBalance
                    ? parseFloat(formatUnits(walletBalance.value, 18)).toFixed(
                        4
                      )
                    : "0.0000"}{" "}
                  ℏ
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">USD Value</p>
                <p className="text-2xl font-bold">${walletValueUSD}</p>
                {hbarPrice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    @ ${hbarPrice.priceUSD.toFixed(4)} per HBAR
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
        <>
          {/* Create Vault Modal */}
          {!hasVault && (
            <VaultCreationModal
              open={createVaultOpen}
              onOpenChange={setCreateVaultOpen}
            />
          )}
        </>
      </>
    );
  }

  return (
    <>
      <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Monitor your positions and manage portfolio risk.
          </p>
          {hbarPrice && priceLastUpdate && (
            <p className="text-xs text-muted-foreground">
              HBAR Price: ${hbarPrice.priceUSD.toFixed(4)} (via Pyth • Updated{" "}
              {priceLastUpdate.toLocaleTimeString()})
            </p>
          )}
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
            isLive={!!hbarPrice}
            tooltip="Total value of assets deposited in your vault"
          />
          <MetricCard
            title="Current Value"
            value={`$${currentValue}`}
            change={changes.value}
            icon={TrendingUp}
            iconColor="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
            subtitle={`${vaultData.tokenCount} token${
              vaultData.tokenCount !== 1 ? "s" : ""
            }`}
            isLive={!!hbarPrice}
            tooltip="Current USD value of your portfolio"
          />
          <MetricCard
            title="Fees Earned"
            value={`$${feesEarned}`}
            change={changes.fees}
            icon={Zap}
            iconColor="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300"
            subtitle="From LP positions"
            isDummy={true}
            tooltip="Fees earned from liquidity provision (coming soon)"
          />
          <MetricCard
            title="HBAR Price"
            value={hbarPrice ? `$${hbarPrice.priceUSD.toFixed(4)}` : "$0.00"}
            change={changes.volatility}
            icon={AlertTriangle}
            iconColor="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300"
            subtitle={
              hbarPrice
                ? `±$${hbarPrice.confidenceUSD.toFixed(4)}`
                : "Loading..."
            }
            isLive={!!hbarPrice}
            tooltip="Real-time HBAR/USD price from Pyth Network"
          />
        </div>

        {/* Quick Actions */}
        <QuickActions vaultAddress={vaultAddress} hasVault={hasVault} />

        {/* Volatility Monitor */}
        <VolatilityMonitor
          threshold={30}
          priceFeedId={PYTH_PRICE_FEEDS.HBAR_USD}
        />

        {/* Active Vaults & Agent Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActiveVaults hbarPrice={hbarPrice} />
          </div>
          <AgentActivityFeed />
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  hbarPrice ? "bg-green-500 animate-pulse" : "bg-orange-500"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                Price Feed:{" "}
                <span
                  className={hbarPrice ? "text-green-500" : "text-orange-500"}
                >
                  {hbarPrice ? "Active" : "Connecting"}
                </span>
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              Network:{" "}
              <span className="font-medium text-foreground">
                Hedera Testnet
              </span>
            </span>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              Source:{" "}
              <span className="font-medium text-foreground">Pyth Hermes</span>
            </span>
          </div>
          {priceLastUpdate && (
            <div className="text-sm text-muted-foreground">
              Last price update:{" "}
              <span className="font-medium text-foreground">
                {priceLastUpdate.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
