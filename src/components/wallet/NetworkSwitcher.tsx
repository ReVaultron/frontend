// components/wallet/NetworkSwitcher.tsx
import React from "react";
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

// Network display configurations
const networkDisplayConfig = {
  1: { name: "Ethereum", color: "bg-blue-500", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
  11155111: { name: "Sepolia", color: "bg-blue-400", icon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
  84532: { name: "Base Sepolia", color: "bg-blue-600", icon: "https://icons.llamao.fi/icons/chains/rsz_base.jpg" },
  295: { name: "Hedera", color: "bg-green-500", icon: "/hedera-hbar-logo.svg" },
  296: { name: "Hedera Testnet", color: "bg-green-400", icon: "/hedera-hbar-logo.svg" },
  // Add more networks as needed
};

interface NetworkSwitcherProps {
  className?: string;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({ className }) => {
  const {
    isConnected,
    chainId,
    getNetworkName,
    supportedNetworks,
    switchToNetwork,
    isLoading,
  } = useWallet();

  if (!isConnected) return null;

  const currentNetwork =
    networkDisplayConfig[chainId as keyof typeof networkDisplayConfig];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center space-x-2 border-primary/20 hover:bg-primary/10 ${className}`}
        >
          {currentNetwork && (
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white bg-white`}
            >
              <img
                src={currentNetwork.icon}
                alt={currentNetwork.name}
                className="w-3 h-3"
              />
            </div>
          )}
          <span>{getNetworkName()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Switch Network
        </div>
        <DropdownMenuSeparator />
        {Object.entries(supportedNetworks).map(([id, network]) => {
          const networkId = parseInt(id);
          const config =
            networkDisplayConfig[
              networkId as keyof typeof networkDisplayConfig
            ];
          const isCurrentNetwork = chainId === networkId;

          return (
            <DropdownMenuItem
              key={networkId}
              onClick={() => !isCurrentNetwork && switchToNetwork(networkId)}
              className={`flex items-center space-x-2 ${
                isCurrentNetwork ? "bg-primary/10" : ""
              }`}
              disabled={isLoading}
            >
              {config && (
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white bg-white`}
                >
                  <img
                    src={config.icon}
                    alt={config.name}
                    className="w-3 h-3"
                  />
                </div>
              )}
              <span className="flex-1">{network.shortName}</span>
              {isCurrentNetwork && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};