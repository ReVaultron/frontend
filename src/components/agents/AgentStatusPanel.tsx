// components/agents/AgentStatusPanel.tsx - FIXED VERSION
import { Activity, Bot, TrendingUp, AlertTriangle, Zap, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAgentSystem, type AgentStatus } from "@/hooks/useAgentSystem";

const agentIcons = {
  volatilityUpdater: TrendingUp,
  volatilityAdvisor: Bot,
  rebalanceChecker: Activity,
  allocationStrategist: AlertTriangle,
  rebalanceExecutor: Zap,
};

export function AgentStatusPanel() {
  const { agentStatuses, allAgentsOnline, refetchStatuses } = useAgentSystem();

  if (!agentStatuses) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Agent System Status
          </CardTitle>
          <CardDescription>Loading agent information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Agent System Status
            </CardTitle>
            <CardDescription>
              Monitoring {agentStatuses.length} autonomous agents
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={allAgentsOnline ? "default" : "destructive"}
              className="h-7 px-3"
            >
              {allAgentsOnline ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  All Online
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  {agentStatuses.filter((a) => a.status === "online").length}/5 Online
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStatuses()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-5">
          {agentStatuses.map((agent) => (
            <AgentStatusCard key={agent.type} agent={agent} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentStatusCard({ agent }: { agent: AgentStatus }) {
  const Icon = agentIcons[agent.type];
  const isOnline = agent.status === "online";

  // Extract latest result data
  const latestResult = agent.latestResult?.data;
  const resultTimestamp = agent.latestResult?.timestamp 
    ? new Date(agent.latestResult.timestamp).toLocaleTimeString()
    : null;

  return (
    <div
      className={cn(
        "relative p-4 border rounded-lg transition-all",
        isOnline
          ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
          : "bg-muted/50 border-border"
      )}
    >
      {/* Status Indicator */}
      <div className="absolute top-2 right-2">
        {isOnline ? (
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-gray-400" />
        )}
      </div>

      {/* Agent Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center mb-3",
          isOnline
            ? "bg-green-100 dark:bg-green-900/50"
            : "bg-muted"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5",
            isOnline ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
          )}
        />
      </div>

      {/* Agent Name */}
      <div className="space-y-1 mb-3">
        <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
        <p className="text-xs text-muted-foreground">Port: {agent.port}</p>
      </div>

      {/* Status Badge */}
      <Badge
        variant={isOnline ? "default" : "secondary"}
        className={cn(
          "w-full justify-center text-xs mb-2",
          isOnline && "bg-green-600 hover:bg-green-700"
        )}
      >
        {isOnline ? "Online" : "Offline"}
      </Badge>

      {/* Execution Stats */}
      {isOnline && agent.executionCount !== undefined && (
        <div className="space-y-1 pt-2 border-t">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Executions:</span>
            <span className="font-medium">{agent.executionCount}</span>
          </div>
          {agent.lastExecutionTime && (
            <div className="text-xs text-muted-foreground">
              Last: {new Date(agent.lastExecutionTime).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Latest Result Preview */}
      {isOnline && latestResult && (
        <div className="mt-2 p-2 rounded bg-background/50 border border-border">
          <div className="text-xs space-y-1">
            {/* Volatility Updater/Advisor */}
            {latestResult.volatilityBps && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volatility:</span>
                <span className="font-medium">{latestResult.volatilityBps} bps</span>
              </div>
            )}
            
            {/* Allocation Strategist */}
            {latestResult.hbarAllocation && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">HBAR:</span>
                <span className="font-medium">{latestResult.hbarAllocation / 100}%</span>
              </div>
            )}
            
            {/* Rebalance Checker */}
            {latestResult.rebalancingNeeded !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={cn(
                  "font-medium",
                  latestResult.rebalancingNeeded ? "text-orange-600" : "text-green-600"
                )}>
                  {latestResult.rebalancingNeeded ? "Needed" : "Balanced"}
                </span>
              </div>
            )}
            
            {/* Success/Error Status */}
            {latestResult.success !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Run:</span>
                <span className={cn(
                  "font-medium",
                  latestResult.success ? "text-green-600" : "text-red-600"
                )}>
                  {latestResult.success ? "Success" : "Failed"}
                </span>
              </div>
            )}
            
            {resultTimestamp && (
              <div className="text-xs text-muted-foreground mt-1 pt-1 border-t">
                Updated: {resultTimestamp}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}