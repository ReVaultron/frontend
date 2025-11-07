import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VaultConfig } from "./VaultCreationWizard";
import { PieChart } from "lucide-react";

interface AllocationSettingsProps {
  config: VaultConfig;
  updateConfig: (updates: Partial<VaultConfig>) => void;
}

export function AllocationSettings({ config, updateConfig }: AllocationSettingsProps) {
  const updateAllocation = (tokenId: string, value: number) => {
    const newAllocations = { ...config.allocations };
    newAllocations[tokenId] = value;

    // Auto-adjust other tokens to maintain 100% total
    const remainingTokens = config.tokens.filter((t) => t !== tokenId);
    const remainingTotal = 100 - value;
    const currentRemainingTotal = remainingTokens.reduce((sum, t) => sum + (config.allocations[t] || 0), 0);

    if (currentRemainingTotal > 0 && remainingTokens.length > 0) {
      remainingTokens.forEach((token) => {
        const ratio = (config.allocations[token] || 0) / currentRemainingTotal;
        newAllocations[token] = remainingTotal * ratio;
      });
    } else if (remainingTokens.length > 0) {
      const equalShare = remainingTotal / remainingTokens.length;
      remainingTokens.forEach((token) => {
        newAllocations[token] = equalShare;
      });
    }

    updateConfig({ allocations: newAllocations });
  };

  const totalAllocation = Object.values(config.allocations).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <PieChart className="h-4 w-4" />
        <p>Set target allocation percentages (must total 100%)</p>
      </div>

      <div className="space-y-6">
        {config.tokens.map((token) => (
          <div key={token} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`allocation-${token}`} className="text-base font-semibold">
                {token}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`allocation-${token}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={config.allocations[token]?.toFixed(1) || "0.0"}
                  onChange={(e) => updateAllocation(token, parseFloat(e.target.value) || 0)}
                  className="w-20 text-right"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              value={[config.allocations[token] || 0]}
              onValueChange={([value]) => updateAllocation(token, value)}
              min={0}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-lg ${Math.abs(totalAllocation - 100) < 0.01 ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}>
        <p className="text-sm font-medium">
          Total Allocation: {totalAllocation.toFixed(1)}%
          {Math.abs(totalAllocation - 100) < 0.01 ? " ✓" : ` (${totalAllocation > 100 ? "over" : "under"} by ${Math.abs(100 - totalAllocation).toFixed(1)}%)`}
        </p>
      </div>
    </div>
  );
}
