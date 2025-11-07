import { Activity, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

const mockData = [
  { time: "00:00", volatility: 2.1 },
  { time: "04:00", volatility: 2.3 },
  { time: "08:00", volatility: 2.8 },
  { time: "12:00", volatility: 3.2 },
  { time: "16:00", volatility: 2.9 },
  { time: "20:00", volatility: 3.0 },
];

interface VolatilityMonitorProps {
  threshold?: number;
}

export function VolatilityMonitor({ threshold = 5.0 }: VolatilityMonitorProps) {
  const currentVolatility = mockData[mockData.length - 1].volatility;
  const isNearThreshold = currentVolatility >= threshold * 0.7;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Real-time Volatility Monitor</h3>
        </div>
        {isNearThreshold && (
          <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning rounded-full">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Approaching Threshold</span>
          </div>
        )}
      </div>

      <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Volatility</p>
            <p className="text-3xl font-bold text-warning">{currentVolatility}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Threshold</p>
            <p className="text-lg font-semibold text-muted-foreground">{threshold}%</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Moderate Risk Level</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <ReferenceLine 
            y={threshold} 
            stroke="hsl(var(--destructive))" 
            strokeDasharray="3 3"
            label={{ value: "Threshold", fill: "hsl(var(--destructive))", fontSize: 12 }}
          />
          <Line 
            type="monotone" 
            dataKey="volatility" 
            stroke="hsl(var(--warning))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--warning))", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
