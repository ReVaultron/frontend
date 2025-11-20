// app/vault/[id]/page.tsx - Complete Implementation
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  RefreshCw, 
  PieChart, 
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownToLine,
  AlertTriangle,
  Activity
} from "lucide-react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  useUserVaultData,
  useVolatilityIndexData,
  useTokenBalance,
} from "@/hooks/useContracts";
import { DEFAULT_PRICE_FEED_ID } from "@/lib/contracts/abis";
import { formatUnits } from "viem";
import { usePythPrice } from "@/hooks/usePythPrices";
import { PYTH_PRICE_FEEDS } from "@/lib/pyth/price-feeds";
import { ETH_DECIMALS, USER_THRESHOLD } from "@/lib/constants";
import { HBARDepositModal } from "@/components/vault/HBARDepositModal";
import { HBARWithdrawModal } from "@/components/vault/HBARWithdrawModal";
import type { Address } from "viem";

export default function VaultDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { address: userAddress, isConnected } = useAccount();
  
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const vaultAddress = id as Address;

  // Get vault data
  const {
    owner,
    hbarBalance,
    hbarBalanceRaw,
    tokenCount,
    tokens,
    refetchHbarBalance,
    refetchTokens,
  } = useUserVaultData(vaultAddress);

  // Get volatility data
  const {
    currentVolatility,
    lastUpdate,
    isStale,
    volatilityData,
    refetchVolatility,
  } = useVolatilityIndexData(DEFAULT_PRICE_FEED_ID);

  // Get HBAR price
  const {
    price: hbarPrice,
    isLoading: priceLoading,
    error: priceError,
  } = usePythPrice({
    priceFeedId: PYTH_PRICE_FEEDS.HBAR_USD,
    refreshInterval: 60000,
  });

  // Calculate vault value in USD
  const vaultValueUSD = useMemo(() => {
    if (!hbarPrice || !hbarBalanceRaw) return 0;
    const hbarAmount = parseFloat(formatUnits(hbarBalanceRaw, ETH_DECIMALS));
    return hbarAmount * hbarPrice.priceUSD;
  }, [hbarPrice, hbarBalanceRaw]);

  // Generate mock performance data (replace with real historical data)
  const performanceData = useMemo(() => {
    const baseValue = vaultValueUSD || 10000;
    const data = [];
    const now = Date.now();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const variance = (Math.random() - 0.5) * 0.1 * baseValue;
      const value = baseValue + variance;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(value.toFixed(2)),
        pnl: parseFloat((value - baseValue).toFixed(2)),
      });
    }
    
    return data;
  }, [vaultValueUSD]);

  // Calculate allocation data
  const allocationData = useMemo(() => {
    if (!hbarBalanceRaw || !vaultValueUSD) {
      return [
        { name: "HBAR", value: 100, color: "hsl(var(--chart-1))", amount: 0, valueUSD: 0},
      ];
    }

    const hbarAmount = parseFloat(formatUnits(hbarBalanceRaw, ETH_DECIMALS));
    const hbarValue = vaultValueUSD;
    
    console.log('hbarAmount', hbarAmount)
    console.log('hbarValue', hbarValue)
    // For now, showing only HBAR
    // TODO: Add other token balances when multiple tokens are supported
    return [
      { 
        name: "HBAR", 
        value: 100, 
        color: "hsl(var(--chart-1))",
        amount: hbarAmount,
        valueUSD: hbarValue,
      },
    ];
  }, [hbarBalanceRaw, vaultValueUSD]);

  // Vault metrics
  const vaultMetrics = useMemo(() => {
    const deposited = vaultValueUSD;
    const currentValue = vaultValueUSD;
    const pnl = 0; // Would come from historical data
    const pnlPercent = 0; // Would come from historical data
    
    return {
      deposited,
      currentValue,
      pnl,
      pnlPercent,
      rebalances: 0, // Would come from RebalanceExecutor history
      feesEarned: 0, // Would come from LP positions
    };
  }, [vaultValueUSD]);

  // Check if user is owner
  const isOwner = useMemo(() => {
    return owner?.toLowerCase() === userAddress?.toLowerCase();
  }, [owner, userAddress]);

  // Refresh all data
  const handleRefresh = () => {
    refetchHbarBalance();
    refetchTokens();
    refetchVolatility();
  };

  // Loading state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Please connect your wallet to view vault details
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  console.log('allocationMap', allocationData)
  // Check if data is loading
  const isLoading = !owner && !hbarBalance;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/vaults")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">My Vault</h1>
                <p className="text-sm text-muted-foreground">
                  Vault: {vaultAddress?.slice(0, 6)}...{vaultAddress?.slice(-4)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={priceLoading}
              >
                <RefreshCw className={`h-4 w-4 ${priceLoading ? 'animate-spin' : ''}`} />
              </Button>
              {isOwner && (
                <>
                  <Button variant="outline" onClick={() => setDepositOpen(true)}>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                  <Button variant="outline" onClick={() => setWithdrawOpen(true)}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Ownership Warning */}
          {!isOwner && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are not the owner of this vault. You can view it but cannot make changes.
              </AlertDescription>
            </Alert>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${vaultMetrics.currentValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {parseFloat(hbarBalance).toFixed(4)} HBAR
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Volatility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentVolatility.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Threshold: {USER_THRESHOLD}%
                  {isStale && " (Stale)"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Associated tokens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>HBAR Price</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${hbarPrice ? hbarPrice.priceUSD.toFixed(4) : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {hbarPrice && `±$${hbarPrice.confidenceUSD.toFixed(4)}`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="allocation" className="space-y-4">
            <TabsList>
              <TabsTrigger value="allocation">
                <PieChart className="h-4 w-4 mr-2" />
                Allocation
              </TabsTrigger>
              <TabsTrigger value="performance">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Allocation Tab */}
            <TabsContent value="allocation" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Allocation</CardTitle>
                    <CardDescription>
                      Token distribution in your vault
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={400}>
                      <RechartsPieChart>
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Token Details</CardTitle>
                    <CardDescription>Breakdown of holdings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {allocationData.map((token, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: token.color }}
                            />
                            <div>
                              <p className="font-semibold">{token.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {token.amount.toFixed(4)} {token.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{token.value}%</p>
                            <p className="text-sm text-muted-foreground">
                              ${token?.valueUSD.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {tokenCount > 1 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Target Allocation
                          </span>
                          <span className="font-medium">50% / 50%</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-muted-foreground">Deviation</span>
                          <span className="font-medium text-warning">
                            Coming soon
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Value Over Time</CardTitle>
                  <CardDescription>
                    Historical performance of your vault
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Note:</strong> Historical performance data is currently
                  simulated. Real historical tracking will be available once you've
                  had the vault active for some time.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Vault transactions and rebalancing history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Activity Yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vault activity and rebalancing history will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      {isOwner && (
        <>
          <HBARDepositModal
            open={depositOpen}
            onOpenChange={setDepositOpen}
            vaultAddress={vaultAddress}
          />
          <HBARWithdrawModal
            open={withdrawOpen}
            onOpenChange={setWithdrawOpen}
            vaultAddress={vaultAddress}
          />
        </>
      )}
    </>
  );
}