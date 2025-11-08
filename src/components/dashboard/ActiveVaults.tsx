import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, ExternalLink, MoreVertical, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DepositModal } from "@/components/vault/DepositModal";
import { WithdrawModal } from "@/components/vault/WithdrawModal";

interface Vault {
  id: string;
  pair: string;
  deposited: string;
  currentValue: string;
  feesEarned: string;
  volatility: number;
  pnl: number;
  status: "active" | "warning" | "critical";
  activeDays: number;
}

const mockVaults: Vault[] = [
  {
    id: "1",
    pair: "HBAR/USDC",
    deposited: "$50.0K",
    currentValue: "$51.2K",
    feesEarned: "+$1.8K",
    volatility: 2.4,
    pnl: 6.0,
    status: "active",
    activeDays: 15,
  },
  {
    id: "2",
    pair: "HBAR/SAUCE",
    deposited: "$75.0K",
    currentValue: "$77.3K",
    feesEarned: "+$2.4K",
    volatility: 3.8,
    pnl: 6.3,
    status: "warning",
    activeDays: 30,
  },
];

export function ActiveVaults() {
  const navigate = useNavigate();
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState("");

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Active Vaults</h3>
        </div>
        <select className="px-3 py-1 text-sm border border-border rounded-md bg-background">
          <option>All Pools</option>
          <option>High Performance</option>
          <option>Low Volatility</option>
        </select>
      </div>

      <div className="space-y-4">
        {mockVaults.map((vault) => (
          <div
            key={vault.id}
            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {vault.pair.split("/")[0].slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{vault.pair}</h4>
                  <p className="text-sm text-muted-foreground">Active for {vault.activeDays} days</p>
                </div>
              </div>
              <Badge
                variant={vault.status === "active" ? "default" : "secondary"}
                className={cn(
                  vault.status === "active" && "bg-success text-success-foreground",
                  vault.status === "warning" && "bg-warning text-warning-foreground"
                )}
              >
                {vault.status === "active" ? "Active" : "Warning"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deposited</p>
                <p className="font-semibold text-foreground">{vault.deposited}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                <p className="font-semibold text-foreground">{vault.currentValue}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fees Earned</p>
                <p className="font-semibold text-success">{vault.feesEarned}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Volatility</p>
                <p className="font-semibold text-warning">{vault.volatility}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">P&L</p>
                <p className="font-semibold text-success">+${(vault.pnl * 1000).toFixed(0)} ({vault.pnl}%)</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Manage
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/vault/${vault.id}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedVault(vault.pair);
                      setDepositModalOpen(true);
                    }}
                  >
                    Deposit More
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedVault(vault.pair);
                      setWithdrawModalOpen(true);
                    }}
                  >
                    Withdraw
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Close Vault</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <DepositModal 
        open={depositModalOpen} 
        onOpenChange={setDepositModalOpen}
        vaultName={selectedVault}
      />
      <WithdrawModal 
        open={withdrawModalOpen} 
        onOpenChange={setWithdrawModalOpen}
        vaultName={selectedVault}
      />
    </Card>
  );
}
