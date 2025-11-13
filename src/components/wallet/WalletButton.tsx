// components/wallet/WalletButton.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, ChevronDown, User, BarChart3, Network } from "lucide-react";
import { useWallet } from "@/hooks/useHederaWallet";
import { NetworkSwitcher } from "./NetworkSwitcher";

interface WalletButtonProps {
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = ({ className }) => {
  const {
    isConnected,
    address,
    connectWallet,
    disconnect,
    getShortAddress,
    getNetworkName,
    isLoading,
  } = useWallet();

  if (isLoading) {
    return (
      <Button variant="hero" disabled className={className}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        Connecting...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="hero" className={`flex items-center space-x-2 ${className}`}>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <Wallet className="h-4 w-4" />
            <span>{getShortAddress()}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-background border-border"
        >
          <div className="px-2 py-1.5 text-sm font-medium">
            Connected to {getNetworkName()}
          </div>
          <div className="px-2 py-1.5 text-xs text-muted-foreground break-all">
            {address}
          </div>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem asChild>
            <a href="/portfolio" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Portfolio
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/charts" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Charts
            </a>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            // onClick={() => window.open(`https://hashscan.io/${getNetworkName().toLowerCase()}/account/${address}`, "_blank")}
          >
           <NetworkSwitcher />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(address || "")}
          >
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="text-red-600">
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
   <>
        <Button
          onClick={connectWallet}
          className="bg-gradient-to-r from-primary to-primary-glow"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </>
  );
};