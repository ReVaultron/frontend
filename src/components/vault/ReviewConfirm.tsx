import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VaultConfig } from "./VaultCreationWizard";
import { Coins, PieChart, Activity, CheckCircle2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatEther } from "viem";

interface ReviewConfirmProps {
  config: VaultConfig;
  creationFee: bigint;
}

// Token registry for display
const TOKEN_NAMES: Record<string, string> = {
  "0x0000000000000000000000000000000000000167": "HBAR",
  "0x0000000000000000000000000000000000068cda": "USDC",
  "0x00000000000000000000000000000000000a5289": "SAUCE",
};

export function ReviewConfirm({ config, creationFee }: ReviewConfirmProps) {
  const getTokenName = (address: string) => {
    return TOKEN_NAMES[address] || `Token ${address.slice(0, 8)}...`;
  };

  const creationFeeHBAR = parseFloat(formatEther(creationFee));

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
                  {getTokenName(token)}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              These tokens will need to be associated with your vault after creation.
            </p>
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
                  <span className="font-medium">{getTokenName(token)}</span>
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
            <p className="text-xs text-muted-foreground mt-3">
              Note: Allocations are for reference. Actual rebalancing will be handled by AI agents.
            </p>
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
            <p className="text-xs text-muted-foreground mt-3">
              When market volatility exceeds this threshold, AI agents will analyze and execute rebalancing.
            </p>
          </CardContent>
        </Card>

        {/* Creation Fee */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Creation Fee</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">One-time vault creation fee</span>
              <span className="text-xl font-bold text-foreground">
                {creationFeeHBAR.toFixed(4)} HBAR
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Plus network gas fees (~0.05 HBAR)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-semibold text-sm">Before you proceed:</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Ensure your wallet has sufficient HBAR for creation fee ({creationFeeHBAR.toFixed(4)} HBAR) and gas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>After creation, you'll need to associate tokens with your vault</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Token allocations and thresholds can be adjusted later</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Vault creation is a one-time process per account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>You will be the owner of this vault and can manage it anytime</span>
          </li>
        </ul>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Your vault, your control
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              You maintain full custody of your funds. AI agents can only execute trades with your explicit authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}