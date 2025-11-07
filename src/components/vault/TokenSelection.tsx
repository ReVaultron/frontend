import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { VaultConfig } from "./VaultCreationWizard";
import { Coins } from "lucide-react";

interface TokenSelectionProps {
  config: VaultConfig;
  updateConfig: (updates: Partial<VaultConfig>) => void;
}

const AVAILABLE_TOKENS = [
  { id: "HBAR", name: "HBAR", description: "Hedera Native Token" },
  { id: "USDC", name: "USDC", description: "USD Coin Stablecoin" },
  { id: "SAUCE", name: "SAUCE", description: "SaucerSwap Token" },
  { id: "KARATE", name: "KARATE", description: "Karate Combat Token" },
  { id: "HSUITE", name: "HSUITE", description: "HashPack Suite Token" },
];

export function TokenSelection({ config, updateConfig }: TokenSelectionProps) {
  const toggleToken = (tokenId: string) => {
    const newTokens = config.tokens.includes(tokenId)
      ? config.tokens.filter((t) => t !== tokenId)
      : [...config.tokens, tokenId];

    // Update allocations when tokens change
    const newAllocations = { ...config.allocations };
    if (!config.tokens.includes(tokenId)) {
      // Adding a token - distribute evenly
      const equalShare = 100 / newTokens.length;
      newTokens.forEach((token) => {
        newAllocations[token] = equalShare;
      });
    } else {
      // Removing a token - redistribute
      delete newAllocations[tokenId];
      const remainingTokens = newTokens.length;
      if (remainingTokens > 0) {
        const equalShare = 100 / remainingTokens;
        newTokens.forEach((token) => {
          newAllocations[token] = equalShare;
        });
      }
    }

    updateConfig({ tokens: newTokens, allocations: newAllocations });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Coins className="h-4 w-4" />
        <p>Select at least 2 tokens for your vault portfolio</p>
      </div>

      <div className="grid gap-4">
        {AVAILABLE_TOKENS.map((token) => (
          <div
            key={token.id}
            className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              config.tokens.includes(token.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
            onClick={() => toggleToken(token.id)}
          >
            <Checkbox
              id={token.id}
              checked={config.tokens.includes(token.id)}
              onCheckedChange={() => toggleToken(token.id)}
            />
            <div className="flex-1">
              <Label htmlFor={token.id} className="text-base font-semibold cursor-pointer">
                {token.name}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">{token.description}</p>
            </div>
          </div>
        ))}
      </div>

      {config.tokens.length > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            Selected Tokens: {config.tokens.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
