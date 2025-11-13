// components/dashboard/VolatilityMonitor.tsx
import { Activity, AlertTriangle, CheckCircle, Clock, Zap, TrendingUp, RefreshCw } from "lucide-react";
import { useVolatilityIndexData } from "@/hooks/useContracts";
import { DEFAULT_PRICE_FEED_ID } from "@/lib/contracts/abis";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface VolatilityMonitorProps {
  threshold: number;
  priceFeedId?: `0x${string}`;
}

export function VolatilityMonitor({ threshold, priceFeedId = DEFAULT_PRICE_FEED_ID }: VolatilityMonitorProps) {
  const {
    currentVolatility,
    volatilityBps,
    lastUpdate,
    updateInterval,
    isStale,
    volatilityData,
    refetchVolatility,
  } = useVolatilityIndexData(priceFeedId);

  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<string>("");

  // Calculate time until next update
  useEffect(() => {
    if (!lastUpdate || !updateInterval) return;

    const interval = setInterval(() => {
      const nextUpdate = lastUpdate + updateInterval;
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = nextUpdate - now;

      if (secondsLeft <= 0) {
        setTimeUntilNextUpdate("Ready to update");
      } else {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        setTimeUntilNextUpdate(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate, updateInterval]);

  const volatilityPercent = (currentVolatility / threshold) * 100;
  const isAboveThreshold = currentVolatility > threshold;

  const getStatusColor = () => {
    if (currentVolatility < threshold * 0.5) return "text-green-600";
    if (currentVolatility < threshold * 0.8) return "text-yellow-600";
    if (currentVolatility < threshold) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusBg = () => {
    if (currentVolatility < threshold * 0.5) return "bg-green-50 dark:bg-green-900/20";
    if (currentVolatility < threshold * 0.8) return "bg-yellow-50 dark:bg-yellow-900/20";
    if (currentVolatility < threshold) return "bg-orange-50 dark:bg-orange-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };

  const getStatusText = () => {
    if (currentVolatility < threshold * 0.5) return "Low Risk";
    if (currentVolatility < threshold * 0.8) return "Moderate Risk";
    if (currentVolatility < threshold) return "Elevated Risk";
    return "High Risk - Action Needed";
  };

  const getProgressBarColor = () => {
    if (currentVolatility < threshold * 0.5) return "from-green-500 to-green-600";
    if (currentVolatility < threshold * 0.8) return "from-yellow-500 to-orange-500";
    if (currentVolatility < threshold) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-600";
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-foreground">Real-time Volatility Monitor</h3>
        <div className="ml-auto flex items-center gap-2">
          {isStale ? (
            <>
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-xs text-orange-600">Stale Data</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Live</span>
            </>
          )}
          <button
            onClick={() => refetchVolatility()}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Current Risk Display */}
      <div className={`${getStatusBg()} rounded-lg p-6 mb-6 border ${isAboveThreshold ? 'border-red-200 dark:border-red-800' : 'border-border'}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Volatility</p>
            <h2 className={`text-5xl font-bold ${getStatusColor()}`}>
              {currentVolatility.toFixed(2)}%
            </h2>
            <p className={`text-sm font-medium mt-2 ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {volatilityBps} basis points
            </p>
          </div>
          {isAboveThreshold ? (
            <AlertTriangle className="w-10 h-10 text-red-600 animate-pulse" />
          ) : (
            <CheckCircle className="w-10 h-10 text-green-600" />
          )}
        </div>

        {/* Volatility Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Your Threshold: {threshold.toFixed(1)}%</span>
            <span>{Math.min(volatilityPercent, 100).toFixed(0)}% of threshold</span>
          </div>
          <div className="relative w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressBarColor()} transition-all duration-500 relative`}
              style={{ width: `${Math.min(volatilityPercent, 100)}%` }}
            >
              {volatilityPercent > 100 && (
                <div className="absolute inset-0 animate-pulse bg-white/20"></div>
              )}
            </div>
            {/* Threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-600"
              style={{ left: "100%" }}
            ></div>
          </div>
        </div>

        {/* Price Information */}
        {volatilityData && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Price</p>
              <p className="text-sm font-semibold">
                ${(volatilityData.price / Math.pow(10, Math.abs(volatilityData.expo))).toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Confidence</p>
              <p className="text-sm font-semibold">
                ±${(volatilityData.confidence / Math.pow(10, Math.abs(volatilityData.expo))).toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Update</p>
              <p className="text-sm font-semibold">
                {lastUpdate
                  ? formatDistanceToNow(new Date(lastUpdate * 1000), { addSuffix: true })
                  : "Never"}
              </p>
            </div>
          </div>
        )}

        {/* Update Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border mt-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              Last updated:{" "}
              {lastUpdate
                ? formatDistanceToNow(new Date(lastUpdate * 1000), { addSuffix: true })
                : "Never"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Next update: {timeUntilNextUpdate || "Calculating..."}</span>
          </div>
        </div>
      </div>

      {/* Position Range Status */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">Position Range</span>
        <div className="flex items-center gap-2">
          {isAboveThreshold ? (
            <>
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Out of Range - Action Needed</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">In Range ✓</span>
            </>
          )}
        </div>
      </div>

      {/* Health Status Banner */}
      {isAboveThreshold ? (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">
                High Volatility Detected
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Current volatility ({currentVolatility.toFixed(2)}%) exceeds your threshold (
                {threshold.toFixed(1)}%). Agents will automatically rebalance your portfolio if
                drift is detected.
              </p>
            </div>
          </div>
        </div>
      ) : isStale ? (
        <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900 dark:text-orange-100">
                Data May Be Stale
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Volatility data hasn't been updated recently. Click refresh or wait for the next
                update cycle.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">Position Healthy</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Volatility is within acceptable range. Agents are monitoring for any changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}