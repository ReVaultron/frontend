import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VaultConfig } from "./VaultCreationWizard";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

interface VolatilityThresholdProps {
  config: VaultConfig;
  updateConfig: (updates: Partial<VaultConfig>) => void;
}

export function VolatilityThreshold({ config, updateConfig }: VolatilityThresholdProps) {
  const getThresholdLevel = (threshold: number) => {
    if (threshold < 20) return { level: "High Frequency", color: "text-destructive", icon: AlertTriangle };
    if (threshold < 40) return { level: "Moderate", color: "text-warning", icon: Activity };
    return { level: "Low Frequency", color: "text-success", icon: CheckCircle2 };
  };

  const thresholdInfo = getThresholdLevel(config.volatilityThreshold);
  const Icon = thresholdInfo.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-4 w-4" />
        <p>Set the volatility threshold that triggers automatic rebalancing</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="threshold" className="text-base font-semibold">
            Volatility Threshold
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="threshold"
              type="number"
              min="5"
              max="100"
              step="1"
              value={config.volatilityThreshold}
              onChange={(e) => updateConfig({ volatilityThreshold: parseFloat(e.target.value) || 30 })}
              className="w-20 text-right"
            />
            <span className="text-muted-foreground">%</span>
          </div>
        </div>

        <Slider
          value={[config.volatilityThreshold]}
          onValueChange={([value]) => updateConfig({ volatilityThreshold: value })}
          min={5}
          max={100}
          step={1}
          className="w-full"
        />

        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="text-left">5% (More frequent)</div>
          <div className="text-center">50%</div>
          <div className="text-right">100% (Less frequent)</div>
        </div>
      </div>

      <div className={`p-4 rounded-lg border bg-card`}>
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 mt-0.5 ${thresholdInfo.color}`} />
          <div>
            <p className="font-semibold">{thresholdInfo.level} Rebalancing</p>
            <p className="text-sm text-muted-foreground mt-1">
              {config.volatilityThreshold < 20 && "Vault will rebalance frequently to maintain tight allocations. Higher gas fees but tighter risk control."}
              {config.volatilityThreshold >= 20 && config.volatilityThreshold < 40 && "Balanced approach - rebalances when market conditions warrant it. Good for most portfolios."}
              {config.volatilityThreshold >= 40 && "Vault will rebalance only during significant market movements. Lower costs but looser allocations."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-sm">How it works:</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Volatility Oracle monitors market conditions every 10 minutes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>When volatility exceeds your threshold, agents analyze if rebalancing is needed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Risk Assessment Agent verifies the rebalancing plan meets safety criteria</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Execution Agent performs the rebalancing automatically via SaucerSwap</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
