import { useState } from "react";
import { ArrowLeft, TrendingUp, DollarSign, Activity, PieChart as PieChartIcon, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type TimePeriod = "24h" | "7d" | "30d" | "all";

// Mock data generators
const generatePerformanceData = (period: TimePeriod) => {
  const baseValue = 10000;
  let dataPoints = 24;
  let dateFormat = (i: number) => `${i}:00`;

  switch (period) {
    case "24h":
      dataPoints = 24;
      dateFormat = (i: number) => `${i}:00`;
      break;
    case "7d":
      dataPoints = 7;
      dateFormat = (i: number) => `Day ${i + 1}`;
      break;
    case "30d":
      dataPoints = 30;
      dateFormat = (i: number) => `Day ${i + 1}`;
      break;
    case "all":
      dataPoints = 90;
      dateFormat = (i: number) => `Day ${i + 1}`;
      break;
  }

  return Array.from({ length: dataPoints }, (_, i) => {
    const randomWalk = Math.random() * 500 - 200;
    const trend = i * 30;
    const value = baseValue + trend + randomWalk;

    return {
      date: dateFormat(i),
      value: Math.round(value),
      pnl: Math.round(value - baseValue),
      hbar: Math.round(value * 0.48),
      usdc: Math.round(value * 0.52),
    };
  });
};

const volumeData = [
  { date: "Mon", volume: 12500, trades: 42 },
  { date: "Tue", volume: 15300, trades: 56 },
  { date: "Wed", volume: 11200, trades: 38 },
  { date: "Thu", volume: 18900, trades: 67 },
  { date: "Fri", volume: 14600, trades: 51 },
  { date: "Sat", volume: 9800, trades: 29 },
  { date: "Sun", volume: 8200, trades: 24 },
];

const allocationHistoryData = [
  { date: "Week 1", hbar: 50, usdc: 50 },
  { date: "Week 2", hbar: 48, usdc: 52 },
  { date: "Week 3", hbar: 52, usdc: 48 },
  { date: "Week 4", hbar: 49, usdc: 51 },
  { date: "Week 5", hbar: 51, usdc: 49 },
  { date: "Week 6", hbar: 48, usdc: 52 },
];

const pieData = [
  { name: "HBAR", value: 48.5, color: "hsl(var(--chart-1))" },
  { name: "USDC", value: 51.5, color: "hsl(var(--chart-2))" },
];

export default function Analytics() {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("7d");
  const [performanceData, setPerformanceData] = useState(() => generatePerformanceData("7d"));

  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    setPerformanceData(generatePerformanceData(period));
  };

  const latestData = performanceData[performanceData.length - 1];
  const firstData = performanceData[0];
  const totalReturn = latestData.value - firstData.value;
  const returnPercent = ((totalReturn / firstData.value) * 100).toFixed(2);

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
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-sm text-muted-foreground">Portfolio performance and insights</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={timePeriod === "24h" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("24h")}
            >
              24H
            </Button>
            <Button
              variant={timePeriod === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("7d")}
            >
              7D
            </Button>
            <Button
              variant={timePeriod === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("30d")}
            >
              30D
            </Button>
            <Button
              variant={timePeriod === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange("all")}
            >
              All Time
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${latestData.value.toLocaleString()}</div>
              <p className={`text-xs mt-1 ${totalReturn >= 0 ? "text-success" : "text-destructive"}`}>
                {totalReturn >= 0 ? "+" : ""}${totalReturn.toLocaleString()} ({returnPercent}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total P&L</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${latestData.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                {latestData.pnl >= 0 ? "+" : ""}${latestData.pnl.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Since inception</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg. Daily Return</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">+1.8%</div>
              <p className="text-xs text-muted-foreground mt-1">Last {timePeriod}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Rebalances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">Automated executions</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="allocation">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Allocation
            </TabsTrigger>
            <TabsTrigger value="volume">
              <Activity className="h-4 w-4 mr-2" />
              Volume
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <Calendar className="h-4 w-4 mr-2" />
              Comparison
            </TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value</CardTitle>
                <CardDescription>Total portfolio value over time</CardDescription>
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
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
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
                <CardDescription>Cumulative P&L over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
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

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Allocation</CardTitle>
                  <CardDescription>Token distribution breakdown</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Allocation History</CardTitle>
                  <CardDescription>How your allocation changed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={allocationHistoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="hbar"
                        stackId="1"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="usdc"
                        stackId="1"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Token Performance</CardTitle>
                <CardDescription>Individual token value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hbar"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="usdc"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volume Tab */}
          <TabsContent value="volume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trading Volume</CardTitle>
                <CardDescription>Weekly trading volume and transaction count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Count</CardTitle>
                  <CardDescription>Number of trades per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="trades"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-3))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volume Summary</CardTitle>
                  <CardDescription>Key volume metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Volume</span>
                    <span className="text-lg font-bold">$90,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Daily Volume</span>
                    <span className="text-lg font-bold">$12,928</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Trades</span>
                    <span className="text-lg font-bold">307</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Trade Size</span>
                    <span className="text-lg font-bold">$295</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Benchmarks</CardTitle>
                <CardDescription>Compare your portfolio against market benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Your Portfolio"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      data={performanceData.map((d, i) => ({ 
                        ...d, 
                        benchmark: firstData.value * (1 + i * 0.002) 
                      }))}
                      dataKey="benchmark"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="50/50 Hold"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Your Return</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">+{returnPercent}%</div>
                  <Badge variant="secondary" className="mt-2">Outperforming</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>50/50 Hold Strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground">+12.3%</div>
                  <Badge variant="outline" className="mt-2">Benchmark</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Alpha</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">+9.7%</div>
                  <Badge variant="secondary" className="bg-success/10 text-success mt-2">Excess Return</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
