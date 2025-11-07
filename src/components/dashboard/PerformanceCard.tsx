import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export function PerformanceCard() {
  return (
    <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-success" />
        <h3 className="text-lg font-semibold">Performance</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">7-Day P&L</p>
          <p className="text-3xl font-bold text-success">+$3,420</p>
          <p className="text-sm text-success mt-1">+2.7% return</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Rebalances</p>
            <p className="text-xl font-semibold text-foreground">12</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Fees Earned</p>
            <p className="text-xl font-semibold text-success">$4,670</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
