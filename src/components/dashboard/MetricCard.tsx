// components/dashboard/MetricCard.tsx - Enhanced
import { LucideIcon, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  isDummy?: boolean;
  isLive?: boolean;
  tooltip?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "bg-primary/10 text-primary",
  subtitle,
  isDummy = false,
  isLive = false,
  tooltip,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-600 font-medium">LIVE</span>
          </div>
        </div>
      )}

      {/* Dummy data indicator */}
      {isDummy && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-2 right-2 cursor-help">
                <AlertCircle className="w-3 h-3 text-orange-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Demo data - Integration pending</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Value */}
          <h3 className="text-2xl font-bold text-foreground mb-2 transition-all duration-200 group-hover:text-primary">
            {value}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
          )}

          {/* Change indicator */}
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive && <TrendingUp className="h-4 w-4 text-green-600" />}
              {isNegative && <TrendingDown className="h-4 w-4 text-red-600" />}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive && "text-green-600",
                  isNegative && "text-red-600",
                  !isPositive && !isNegative && "text-muted-foreground"
                )}
              >
                {isPositive && "+"}
                {change.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last period</span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className={cn("p-3 rounded-lg transition-all duration-200 group-hover:scale-110", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300 pointer-events-none" />
    </Card>
  );
}