// components/wallet/NetworkSwitcher.tsx
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { useWallet } from "@/hooks/useHederaWallet";

const networkDisplay = {
  295: { name: "Hedera", icon: "/hedera-hbar-logo.svg" },
  296: { name: "Hedera Testnet", icon: "/hedera-hbar-logo.svg" },
  11155111: { name: "Sepolia", icon: "/eth.svg" },
  84532: { name: "Base Sepolia", icon: "/base.png" },
};

export const NetworkSwitcher = React.memo(() => {
  const { isConnected, chainId, supportedNetworks, switchToNetwork, isLoading } =
    useWallet();

  const config = useMemo(() => networkDisplay[chainId], [chainId]);

  if (!isConnected) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          {config && (
            <img src={config.icon} className="w-4 h-4 rounded-full" />
          )}
          <span>{config?.name || "Unknown"}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium">
          Switch Network
        </div>
        <DropdownMenuSeparator />

        {Object.entries(supportedNetworks).map(([id, network]) => {
          const netId = Number(id);
          const isCurrent = chainId === netId;
          const cfg = networkDisplay[netId];

          return (
            <DropdownMenuItem
              key={id}
              disabled={isLoading}
              className={`flex items-center space-x-2 ${isCurrent ? "bg-primary/10" : ""}`}
              onClick={() => !isCurrent && switchToNetwork(netId)}
            >
              {cfg && <img src={cfg.icon} className="w-4 h-4 rounded-full" />}
              <span className="flex-1">{network.shortName}</span>
              {isCurrent && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
