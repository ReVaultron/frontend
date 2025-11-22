// hooks/useAgentSystem.ts - FIXED VERSION
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AGENT_PORTS = {
  volatilityUpdater: 4001,
  volatilityAdvisor: 4002,
  rebalanceChecker: 4003,
  allocationStrategist: 4004,
  rebalanceExecutor: 4005,
};

const AGENT_BASE_URL = process.env.NEXT_PUBLIC_AGENT_BASE_URL || 'http://localhost';

export type AgentType = keyof typeof AGENT_PORTS;

export interface AgentStatus {
  name: string;
  type: AgentType;
  status: 'online' | 'offline' | 'error';
  lastCheck: Date;
  port: number;
  executionCount?: number;
  lastExecutionTime?: Date;
  latestResult?: any; // NEW: Contains actual result data
}

export interface AgentActivity {
  id: string;
  agentType: AgentType;
  agentName: string;
  action: string;
  message: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'success' | 'error';
  data?: Record<string, any>;
}

export interface VolatilityUpdate {
  success: boolean;
  volatilityBps: number;
  price: number;
  timestamp: number;
  txHash?: string;
  error?: string;
}

export interface AllocationRecommendation {
  hbarAllocation: number;
  usdcAllocation: number;
  confidence: number;
  reasoning: string;
}

export interface RebalanceCheck {
  rebalancingNeeded: boolean;
  drift: number;
  executed: boolean;
  executionResult?: any;
  error?: string;
}

/**
 * Main hook for managing the A2A agent system
 */
export function useAgentSystem() {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const activityIdCounter = useRef(0);
  const queryClient = useQueryClient();

  console.log('activities', activities)

  // Check agent health and get latest results
  const { data: agentStatuses, refetch: refetchStatuses } = useQuery({
    queryKey: ['agent-statuses'],
    queryFn: async () => {
      const statuses: AgentStatus[] = [];
      
      for (const [type, port] of Object.entries(AGENT_PORTS)) {
        try {
          const response = await fetch(
            `${AGENT_BASE_URL}:${port}/status`,
            { 
              signal: AbortSignal.timeout(5000),
              headers: { 'Accept': 'application/json' }
            }
          );
          console.log('response', response)
          if (response.ok) {
            const data = await response.json();
            console.log('data', data)
            statuses.push({
              name: data.agent || type,
              type: type as AgentType,
              status: 'online',
              lastCheck: new Date(),
              port,
              executionCount: data.executionCount,
              lastExecutionTime: data.lastExecutionTime ? new Date(data.lastExecutionTime) : undefined,
              latestResult: data.latestResult, // NEW: Include the result
            });
          } else {
            statuses.push({
              name: type,
              type: type as AgentType,
              status: 'offline',
              lastCheck: new Date(),
              port,
            });
          }
        } catch (error) {
          statuses.push({
            name: type,
            type: type as AgentType,
            status: 'offline',
            lastCheck: new Date(),
            port,
          });
        }
      }
      
      return statuses;
    },
    refetchInterval: 60000, // Check every 60 seconds
    staleTime: 5000,
  });

  console.log('agentStatuses', agentStatuses)

  // Add activity to feed
  const addActivity = useCallback((activity: Omit<AgentActivity, 'id'>) => {
    setActivities(prev => [
      {
        ...activity,
        id: `activity_${Date.now()}_${activityIdCounter.current++}`,
      },
      ...prev,
    ].slice(0, 100)); // Keep last 100
  }, []);

  // Auto-generate activities from agent results
  useEffect(() => {
    if (!agentStatuses) return;

    agentStatuses.forEach((agent) => {
      if (agent.latestResult?.data) {
        const result = agent.latestResult.data;
        
        // Create activity based on agent type
        if (agent.type === 'volatilityUpdater' && result.success) {
          addActivity({
            agentType: agent.type,
            agentName: agent.name,
            action: 'update_volatility',
            message: `Updated volatility to ${result.volatilityBps} bps`,
            timestamp: new Date(agent.latestResult.timestamp),
            severity: 'success',
            data: result,
          });
        } else if (agent.type === 'volatilityAdvisor' && result.volatilityBps) {
          addActivity({
            agentType: agent.type,
            agentName: agent.name,
            action: 'recommend_volatility',
            message: `Recommended ${result.volatilityBps} bps (${(result.confidence * 100).toFixed(0)}% confidence)`,
            timestamp: new Date(agent.latestResult.timestamp),
            severity: 'info',
            data: result,
          });
        } else if (agent.type === 'allocationStrategist' && result.hbarAllocation) {
          addActivity({
            agentType: agent.type,
            agentName: agent.name,
            action: 'recommend_allocation',
            message: `Strategy: ${result.hbarAllocation / 100}% HBAR / ${result.usdcAllocation / 100}% USDC`,
            timestamp: new Date(agent.latestResult.timestamp),
            severity: 'info',
            data: result,
          });
        } else if (agent.type === 'rebalanceChecker') {
          addActivity({
            agentType: agent.type,
            agentName: agent.name,
            action: 'check_rebalance',
            message: result.rebalancingNeeded 
              ? `Rebalancing needed - Drift: ${result.drift} bps` 
              : 'Portfolio balanced',
            timestamp: new Date(agent.latestResult.timestamp),
            severity: result.rebalancingNeeded ? 'warning' : 'success',
            data: result,
          });
        }
      }
    });
  }, [agentStatuses, addActivity]);

  const allAgentsOnline = agentStatuses?.every(s => s.status === 'online') ?? false;

  const getAgentStatus = useCallback((type: AgentType) => {
    return agentStatuses?.find(s => s.type === type);
  }, [agentStatuses]);

  return {
    agentStatuses,
    activities,
    allAgentsOnline,
    addActivity,
    getAgentStatus,
    refetchStatuses,
  };
}

/**
 * Hook for monitoring volatility updates (Agent 1 & 2)
 */
export function useVolatilityMonitoring() {
  const { getAgentStatus } = useAgentSystem();

  const updaterStatus = getAgentStatus('volatilityUpdater');
  const advisorStatus = getAgentStatus('volatilityAdvisor');

  console.log('updaterStatus', updaterStatus);
  console.log('advisorStatus', advisorStatus);

  // Get latest update result
  const latestUpdate = updaterStatus?.latestResult?.data as VolatilityUpdate | undefined;
  const latestRecommendation = advisorStatus?.latestResult?.data;

  console.log('latestUpdate', latestUpdate);
  console.log('latestRecommendation', latestRecommendation);

  return {
    latestUpdate,
    latestRecommendation,
    isLoading: false,
    updaterStatus,
    advisorStatus,
  };
}

/**
 * Hook for monitoring rebalancing checks (Agent 3, 4, 5)
 */
export function useRebalanceMonitoring() {
  const { getAgentStatus } = useAgentSystem();

  const checkerStatus = getAgentStatus('rebalanceChecker');
  const strategistStatus = getAgentStatus('allocationStrategist');
  const executorStatus = getAgentStatus('rebalanceExecutor');

  const rebalanceStatus = checkerStatus?.latestResult?.data as RebalanceCheck | undefined;
  const allocationStrategy = strategistStatus?.latestResult?.data as AllocationRecommendation | undefined;

  return {
    rebalanceStatus,
    allocationStrategy,
    isLoading: false,
    checkerStatus,
    strategistStatus,
    executorStatus,
  };
}

/**
 * Hook to fetch specific agent result
 */
export function useAgentResult(agentType: AgentType) {
  const port = AGENT_PORTS[agentType];

  return useQuery({
    queryKey: ['agent-result', agentType],
    queryFn: async () => {
      const response = await fetch(
        `${AGENT_BASE_URL}:${port}/latest-result`,
        { 
          signal: AbortSignal.timeout(5000),
          headers: { 'Accept': 'application/json' }
        }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No results yet
        }
        throw new Error('Failed to fetch result');
      }
      
      return response.json();
    },
    refetchInterval: 15000, // Check every 15 seconds
    retry: 1,
  });
}

/**
 * Hook for triggering manual agent actions
 */
export function useAgentActions() {
  const queryClient = useQueryClient();

  const triggerAgent = useCallback(async (
    agentType: AgentType, 
    action: string, 
    params: any = {}
  ) => {
    const port = AGENT_PORTS[agentType];
    
    try {
      const response = await fetch(
        `${AGENT_BASE_URL}:${port}/.well-known/agent-card.json`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            parameters: params,
          }),
        }
      );
      
      if (response.ok) {
        // Invalidate queries to fetch new data
        queryClient.invalidateQueries({ queryKey: ['agent-statuses'] });
        queryClient.invalidateQueries({ queryKey: ['agent-result', agentType] });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Failed to trigger ${agentType}:`, error);
      return false;
    }
  }, [queryClient]);

  return { triggerAgent };
}