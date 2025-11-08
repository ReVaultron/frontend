import { useState, useEffect, useRef } from "react";
import { Activity, Bot, AlertTriangle, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AgentMessage {
  id: string;
  agentType: "volatility" | "portfolio" | "risk" | "execution";
  agentName: string;
  message: string;
  timestamp: Date;
  severity: "info" | "warning" | "success" | "error";
  data?: Record<string, any>;
}

const agentConfig = {
  volatility: {
    name: "Volatility Oracle",
    icon: TrendingUp,
    color: "hsl(var(--chart-1))",
    bgColor: "bg-chart-1/10",
  },
  portfolio: {
    name: "Portfolio Manager",
    icon: Bot,
    color: "hsl(var(--chart-2))",
    bgColor: "bg-chart-2/10",
  },
  risk: {
    name: "Risk Assessment",
    icon: AlertTriangle,
    color: "hsl(var(--chart-3))",
    bgColor: "bg-chart-3/10",
  },
  execution: {
    name: "Execution Agent",
    icon: Zap,
    color: "hsl(var(--chart-4))",
    bgColor: "bg-chart-4/10",
  },
};

// Mock HCS message generator
const generateMockMessage = (): AgentMessage => {
  const agents = ["volatility", "portfolio", "risk", "execution"] as const;
  const randomAgent = agents[Math.floor(Math.random() * agents.length)];

  const messages: Record<typeof randomAgent, { message: string; severity: AgentMessage["severity"]; data?: any }[]> = {
    volatility: [
      { message: "Market volatility detected: 24.3%", severity: "info", data: { volatility: 24.3 } },
      { message: "Volatility threshold approaching: 28.5%", severity: "warning", data: { volatility: 28.5 } },
      { message: "High volatility alert: 32.1%", severity: "error", data: { volatility: 32.1 } },
      { message: "Volatility normalized: 18.2%", severity: "success", data: { volatility: 18.2 } },
    ],
    portfolio: [
      { message: "Analyzing portfolio allocation", severity: "info" },
      { message: "Rebalancing recommendation generated", severity: "warning" },
      { message: "Portfolio optimization complete", severity: "success" },
      { message: "Allocation drift detected: 3.2%", severity: "warning", data: { drift: 3.2 } },
    ],
    risk: [
      { message: "Risk assessment initiated", severity: "info" },
      { message: "Risk score: Low (2.1/10)", severity: "success", data: { riskScore: 2.1 } },
      { message: "Risk score: Medium (5.8/10)", severity: "warning", data: { riskScore: 5.8 } },
      { message: "Risk mitigation approved", severity: "success" },
    ],
    execution: [
      { message: "Swap transaction initiated", severity: "info" },
      { message: "Executing swap: 250 USDC → 2,083 HBAR", severity: "info", data: { from: "USDC", to: "HBAR" } },
      { message: "Transaction confirmed on Hedera", severity: "success" },
      { message: "Rebalancing complete", severity: "success" },
    ],
  };

  const agentMessages = messages[randomAgent];
  const randomMessage = agentMessages[Math.floor(Math.random() * agentMessages.length)];

  return {
    id: `msg_${Date.now()}_${Math.random()}`,
    agentType: randomAgent,
    agentName: agentConfig[randomAgent].name,
    message: randomMessage.message,
    timestamp: new Date(),
    severity: randomMessage.severity,
    data: randomMessage.data,
  };
};

export function AgentActivityFeed() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLive, setIsLive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add initial messages
    const initialMessages = Array.from({ length: 5 }, () => generateMockMessage());
    setMessages(initialMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

    // Simulate real-time HCS messages
    const interval = setInterval(() => {
      if (isLive) {
        const newMessage = generateMockMessage();
        setMessages((prev) => [newMessage, ...prev].slice(0, 50)); // Keep last 50 messages
      }
    }, 5000 + Math.random() * 5000); // Random interval between 5-10 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    // Auto-scroll to top when new message arrives
    if (scrollRef.current && isLive) {
      scrollRef.current.scrollTop = 0;
    }
  }, [messages, isLive]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSeverityColor = (severity: AgentMessage["severity"]) => {
    switch (severity) {
      case "success":
        return "bg-success/10 text-success border-success/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Agent Activity Feed</CardTitle>
              <CardDescription>Real-time HCS messages from autonomous agents</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            )}
            <Badge
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? "Pause" : "Resume"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => {
              const config = agentConfig[msg.agentType];
              const Icon = config.icon;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all hover:shadow-md",
                    getSeverityColor(msg.severity)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn("p-2 rounded-full", config.bgColor)}
                      style={{ borderColor: config.color }}
                    >
                      <Icon className="h-4 w-4" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm">{msg.agentName}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      {msg.data && (
                        <div className="mt-2 p-2 rounded bg-background/50 border">
                          <pre className="text-xs text-muted-foreground overflow-x-auto">
                            {JSON.stringify(msg.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
