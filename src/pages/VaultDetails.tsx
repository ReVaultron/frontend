import { ArrowLeft, TrendingUp, RefreshCw, PieChart, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

const performanceData = [
  { date: "Jan 1", value: 10000, pnl: 0 },
  { date: "Jan 8", value: 10250, pnl: 250 },
  { date: "Jan 15", value: 10180, pnl: 180 },
  { date: "Jan 22", value: 10520, pnl: 520 },
  { date: "Jan 29", value: 10890, pnl: 890 },
  { date: "Feb 5", value: 11150, pnl: 1150 },
  { date: "Feb 12", value: 10920, pnl: 920 },
  { date: "Feb 19", value: 11340, pnl: 1340 },
  { date: "Feb 26", value: 11680, pnl: 1680 },
  { date: "Mar 4", value: 12200, pnl: 2200 },
];

const rebalancingHistory = [
  {
    id: 1,
    date: "2025-03-04 14:23",
    trigger: "Volatility threshold exceeded (32%)",
    from: { token: "USDC", amount: 320 },
    to: { token: "HBAR", amount: 2667 },
    fees: 4.2,
    status: "Completed",
  },
  {
    id: 2,
    date: "2025-02-28 09:15",
    trigger: "Volatility threshold exceeded (31%)",
    from: { token: "HBAR", amount: 1890 },
    to: { token: "USDC", amount: 227 },
    fees: 3.8,
    status: "Completed",
  },
  {
    id: 3,
    date: "2025-02-21 16:42",
    trigger: "Volatility threshold exceeded (33%)",
    from: { token: "USDC", amount: 285 },
    to: { token: "HBAR", amount: 2375 },
    fees: 3.9,
    status: "Completed",
  },
  {
    id: 4,
    date: "2025-02-14 11:08",
    trigger: "Volatility threshold exceeded (30%)",
    from: { token: "HBAR", amount: 2100 },
    to: { token: "USDC", amount: 252 },
    fees: 4.1,
    status: "Completed",
  },
];

const allocationData = [
  { name: "HBAR", value: 48.5, color: "hsl(var(--chart-1))" },
  { name: "USDC", value: 51.5, color: "hsl(var(--chart-2))" },
];

export default function VaultDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const vaultInfo = {
    id: id || "0x1234...5678",
    name: "HBAR/USDC Balanced",
    totalValue: 12200,
    deposited: 10000,
    pnl: 2200,
    pnlPercent: 22.0,
    volatilityThreshold: 30,
    currentVolatility: 24.3,
    rebalances: 12,
    feesEarned: 48.2,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{vaultInfo.name}</h1>
              <p className="text-sm text-muted-foreground">Vault ID: {vaultInfo.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Rebalance Now
            </Button>
            <Button>Manage Vault</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${vaultInfo.totalValue.toLocaleString()}</div>
              <p className="text-xs text-success mt-1">+${vaultInfo.pnl.toLocaleString()} ({vaultInfo.pnlPercent}%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Volatility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vaultInfo.currentVolatility}%</div>
              <p className="text-xs text-muted-foreground mt-1">Threshold: {vaultInfo.volatilityThreshold}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Rebalances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vaultInfo.rebalances}</div>
              <p className="text-xs text-muted-foreground mt-1">Automated actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Fees Earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${vaultInfo.feesEarned}</div>
              <p className="text-xs text-success mt-1">From LP positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="allocation">
              <PieChart className="h-4 w-4 mr-2" />
              Allocation
            </TabsTrigger>
            <TabsTrigger value="history">
              <Calendar className="h-4 w-4 mr-2" />
              Rebalancing History
            </TabsTrigger>
          </TabsList>

          {/* Performance Chart */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value Over Time</CardTitle>
                <CardDescription>Historical performance of your vault</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
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

            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss</CardTitle>
                <CardDescription>Cumulative P&L over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Allocation Pie Chart */}
          <TabsContent value="allocation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Allocation</CardTitle>
                  <CardDescription>Token distribution in your vault</CardDescription>
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
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: allocationData[0].color }} />
                        <div>
                          <p className="font-semibold">HBAR</p>
                          <p className="text-sm text-muted-foreground">Hedera Token</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{allocationData[0].value}%</p>
                        <p className="text-sm text-muted-foreground">$5,917</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: allocationData[1].color }} />
                        <div>
                          <p className="font-semibold">USDC</p>
                          <p className="text-sm text-muted-foreground">USD Coin</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{allocationData[1].value}%</p>
                        <p className="text-sm text-muted-foreground">$6,283</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target Allocation</span>
                      <span className="font-medium">50% / 50%</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Deviation</span>
                      <span className="font-medium text-warning">1.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rebalancing History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Rebalancing History</CardTitle>
                <CardDescription>Automatic portfolio adjustments triggered by volatility</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rebalancingHistory.map((rebalance) => (
                      <TableRow key={rebalance.id}>
                        <TableCell className="font-medium">{rebalance.date}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{rebalance.trigger}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{rebalance.from.amount} {rebalance.from.token}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{rebalance.to.amount} {rebalance.to.token}</span>
                          </div>
                        </TableCell>
                        <TableCell>${rebalance.fees}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">
                            {rebalance.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
