// components/agents/AgentActivityFeed.tsx - FIXED VERSION
import { useEffect, useRef } from "react";
import { 
  Activity, 
  Bot, 
  AlertTriangle, 
  Zap, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  useAgentSystem, 
  useVolatilityMonitoring, 
  useRebalanceMonitoring,
  type AgentActivity 
} from "@/hooks/useAgentSystem";

const agentConfig = {
  volatilityUpdater: {
    name: "Volatility Updater",
    icon: TrendingUp,
    color: "hsl(var(--chart-1))",
    bgColor: "bg-chart-1/10",
  },
  volatilityAdvisor: {
    name: "Volatility Advisor",
    icon: Bot,
    color: "hsl(var(--chart-2))",
    bgColor: "bg-chart-2/10",
  },
  rebalanceChecker: {
    name: "Rebalance Checker",
    icon: Activity,
    color: "hsl(var(--chart-3))",
    bgColor: "bg-chart-3/10",
  },
  allocationStrategist: {
    name: "Allocation Strategist",
    icon: AlertTriangle,
    color: "hsl(var(--chart-4))",
    bgColor: "bg-chart-4/10",
  },
  rebalanceExecutor: {
    name: "Rebalance Executor",
    icon: Zap,
    color: "hsl(var(--chart-5))",
    bgColor: "bg-chart-5/10",
  },
};

export function AgentActivityFeed() {
  const { activities, allAgentsOnline, agentStatuses } = useAgentSystem();
  const { latestUpdate, latestRecommendation } = useVolatilityMonitoring();
  const { rebalanceStatus, allocationStrategy } = useRebalanceMonitoring();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new activity arrives
  useEffect(() => {
    if (scrollRef.current && activities.length > 0) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activities.length]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSeverityColor = (severity: AgentActivity["severity"]) => {
    switch (severity) {
      case "success":
        return "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-100 dark:border-green-800";
      case "warning":
        return "bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-900/20 dark:text-orange-100 dark:border-orange-800";
      case "error":
        return "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-100 dark:border-red-800";
      default:
        return "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-100 dark:border-blue-800";
    }
  };

  const getSeverityIcon = (severity: AgentActivity["severity"]) => {
    switch (severity) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  // Show loading state while agents are starting
  if (!agentStatuses) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agent Activity Feed</CardTitle>
              <CardDescription>Loading agent data...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Agent Activity Feed</CardTitle>
              <CardDescription>Real-time activity from autonomous agents</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allAgentsOnline ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-xs text-muted-foreground">
                  {agentStatuses.filter(a => a.status === 'online').length}/5 Online
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {/* Current Status Summary - Only show when we have data */}
        {allAgentsOnline && (latestUpdate || allocationStrategy) && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Latest Volatility</p>
                <p className="font-semibold">
                  {latestUpdate?.volatilityBps 
                    ? `${latestUpdate.volatilityBps} bps` 
                    : latestRecommendation?.volatilityBps 
                    ? `${latestRecommendation.volatilityBps} bps (rec)`
                    : 'Pending...'}
                </p>
                {latestUpdate?.txHash && (
                  <a 
                    href={`https://hashscan.io/testnet/transaction/${latestUpdate.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View TX ↗
                  </a>
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Allocation Strategy</p>
                <p className="font-semibold">
                  {allocationStrategy 
                    ? `${allocationStrategy.hbarAllocation / 100}% HBAR`
                    : 'Calculating...'}
                </p>
                {allocationStrategy && (
                  <p className="text-xs text-muted-foreground">
                    Confidence: {(allocationStrategy.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {allAgentsOnline 
                  ? 'Waiting for agent activity...'
                  : 'Agents are starting up...'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Activity will appear here automatically
              </p>
              {!allAgentsOnline && (
                <div className="mt-4 space-y-1">
                  {agentStatuses.map((agent) => (
                    <div key={agent.type} className="text-xs flex items-center gap-2">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        agent.status === 'online' ? "bg-green-500" : "bg-gray-400"
                      )} />
                      <span className={agent.status === 'online' ? "text-green-600" : "text-muted-foreground"}>
                        {agent.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const config = agentConfig[activity.agentType];
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all hover:shadow-md",
                      getSeverityColor(activity.severity)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn("p-2 rounded-full flex-shrink-0", config.bgColor)}
                        style={{ borderColor: config.color }}
                      >
                        <Icon className="h-4 w-4" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{activity.agentName}</span>
                            {getSeverityIcon(activity.severity)}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm mb-1">{activity.message}</p>
                        
                        {/* Show reasoning for AI agents */}
                        {activity.data?.reasoning && (
                          <div className="mt-2 p-2 rounded bg-background/50 border border-border">
                            <p className="text-xs text-muted-foreground italic">
                              "{activity.data.reasoning}"
                            </p>
                          </div>
                        )}
                        
                        {/* Show transaction hash */}
                        {activity.data?.txHash && (
                          <a
                            href={`https://hashscan.io/testnet/transaction/${activity.data.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-2 inline-block"
                          >
                            View Transaction ↗
                          </a>
                        )}
                        
                        {activity.action && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {activity.action}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}