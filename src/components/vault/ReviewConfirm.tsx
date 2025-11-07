import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VaultConfig } from "./VaultCreationWizard";
import { Coins, PieChart, Activity, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReviewConfirmProps {
  config: VaultConfig;
}

export function ReviewConfirm({ config }: ReviewConfirmProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4" />
        <p>Review your vault configuration before creating</p>
      </div>

      <div className="grid gap-4">
        {/* Token Selection Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Selected Tokens</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {config.tokens.map((token) => (
                <Badge key={token} variant="secondary" className="text-sm">
                  {token}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allocation Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Target Allocations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.tokens.map((token) => (
                <div key={token} className="flex items-center justify-between">
                  <span className="font-medium">{token}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${config.allocations[token]}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">
                      {config.allocations[token]?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Volatility Threshold Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Volatility Threshold</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rebalancing triggers at</span>
              <span className="text-2xl font-bold text-primary">
                {config.volatilityThreshold}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-semibold text-sm">Before you proceed:</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Ensure your wallet has sufficient HBAR for gas fees and initial deposits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Agent authorization will be requested after vault creation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>You can modify settings later except for selected tokens</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Initial deployment takes approximately 30-60 seconds</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
