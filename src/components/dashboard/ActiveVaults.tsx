// components/dashboard/ActiveVaults.tsx
import {
  Activity,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useUserVaultAddress, useUserVaultData, useVolatilityIndexData } from "@/hooks/useContracts";
import {
  CONTRACT_ADDRESSES,
  DEFAULT_PRICE_FEED_ID,
} from "@/lib/contracts/abis";
import { formatDistanceToNow } from "date-fns";
import { useAccount } from "wagmi";

export function ActiveVaults() {
  const { address: userAddress, isConnected } = useAccount();
  const { vaultAddress, hasVault } = useUserVaultAddress(userAddress);
  const vaultData = useUserVaultData(vaultAddress);
  const { currentVolatility } = useVolatilityIndexData(DEFAULT_PRICE_FEED_ID);

  // User threshold (would come from settings in production)
  const userThreshold = 30.0;
  const isAboveThreshold = currentVolatility > userThreshold;

  const riskLevel = (() => {
    const ratio = currentVolatility / userThreshold;
    if (ratio < 0.5)
      return {
        level: "Low",
        color: "text-green-600",
        bg: "bg-green-100 dark:bg-green-900",
      };
    if (ratio < 0.8)
      return {
        level: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-100 dark:bg-yellow-900",
      };
    if (ratio < 1.0)
      return {
        level: "Elevated",
        color: "text-orange-600",
        bg: "bg-orange-100 dark:bg-orange-900",
      };
    return {
      level: "High",
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900",
    };
  })();

  const status = isAboveThreshold
    ? {
        label: "Warning",
        color: "text-yellow-700",
        bg: "bg-yellow-100 dark:bg-yellow-900",
      }
    : {
        label: "Active",
        color: "text-green-700",
        bg: "bg-green-100 dark:bg-green-900",
      };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-300" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Active Vault
          </h3>
        </div>
        <select className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium border border-border">
          <option>My Vault</option>
        </select>
      </div>

      <div className="space-y-4">
        {/* Vault Card */}
        <div className="border border-border rounded-lg p-5 hover:border-primary/50 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Vault Icon */}
              <div className="flex items-center gap-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">
                  Multi-Token Vault
                </h4>
                <p className="text-sm text-muted-foreground">
                  {vaultData.tokenCount} token
                  {vaultData.tokenCount !== 1 ? "s" : ""} supported
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
              >
                {status.label}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">HBAR Balance</p>
              <p className="text-lg font-semibold text-foreground">
                {vaultData.hbarBalance} ℏ
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Value</p>
              <p className="text-lg font-semibold text-foreground">
                ${vaultData.totalValue}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
              <p className={`text-lg font-semibold ${riskLevel.color}`}>
                {riskLevel.level}
              </p>
            </div>
          </div>

          {/* Token List */}
          {Array.isArray(vaultData.tokens) && vaultData.tokens.length > 0 ? (
            <div className="mb-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">
                  Supported Tokens
                </p>
                <p className="text-xs text-muted-foreground">
                  {vaultData.tokenCount} total
                </p>
              </div>
              <div className="space-y-2">
                {vaultData.tokens
                  .slice(0, 3)
                  .map((token: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                        <span className="font-mono text-xs">
                          {token.slice(0, 10)}...
                        </span>
                      </div>
                      <span className="text-muted-foreground">Associated</span>
                    </div>
                  ))}
                {vaultData.tokens.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{vaultData.tokens.length - 3} more token
                    {vaultData.tokens.length - 3 !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                No tokens associated yet
              </p>
              <button className="mt-2 text-xs text-primary hover:text-primary/80">
                Associate Tokens
              </button>
            </div>
          )}

          {/* Status Banner */}
          {isAboveThreshold ? (
            <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>High Volatility:</strong> Current volatility (
                  {currentVolatility.toFixed(1)}%) exceeds threshold (
                  {userThreshold}%). Monitor closely.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Portfolio is within safe volatility range.
                </p>
              </div>
            </div>
          )}

          {/* Volatility Info */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Volatility Threshold
              </span>
              <span className="font-semibold">{userThreshold.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Current Volatility</span>
              <span
                className={`font-semibold ${
                  isAboveThreshold ? "text-red-600" : "text-green-600"
                }`}
              >
                {currentVolatility.toFixed(2)}%
                {isAboveThreshold && (
                  <span className="ml-1 text-xs">⚠️ Above threshold</span>
                )}
              </span>
            </div>
          </div>

          {/* Owner Info */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Owner</span>
              <span className="font-mono text-xs">
                {vaultData.owner && typeof vaultData.owner === "string"
                  ? `${vaultData.owner.slice(0, 6)}...${vaultData.owner.slice(
                      -4
                    )}`
                  : "Loading..."}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Vault Address</span>
              <span className="font-mono text-xs">
                {vaultData.address
                  ? `${vaultData.address.slice(
                      0,
                      6
                    )}...${vaultData.address.slice(-4)}`
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Manage
            </button>
            <button className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View Details <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              href={`https://hashscan.io/testnet/contract/${vaultData.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View on HashScan ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate drift
function calculateDrift(
  current: readonly bigint[],
  target: readonly bigint[]
): number {
  if (current.length === 0 || target.length === 0) return 0;

  let totalDrift = 0;
  for (let i = 0; i < current.length; i++) {
    const currentPercent = Number(current[i]) / 100;
    const targetPercent = Number(target[i]) / 100;
    totalDrift += Math.abs(currentPercent - targetPercent);
  }

  return totalDrift / current.length;
}
