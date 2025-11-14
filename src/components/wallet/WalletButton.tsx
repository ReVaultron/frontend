// components/wallet/WalletButton.tsx
import React, { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, ChevronDown } from "lucide-react";
import { useWallet } from "@/hooks/useHederaWallet";
import { NetworkSwitcher } from "./NetworkSwitcher";

interface WalletButtonProps {
  className?: string;
}

export const WalletButton: React.FC<WalletButtonProps> = React.memo(
  ({ className }) => {
    const {
      isConnected,
      address,
      connectWallet,
      disconnect,
      getShortAddress,
      getNetworkName,
      isLoading,
    } = useWallet();

    const shortAddress = useMemo(() => getShortAddress(), [address]);
    const networkName = useMemo(() => getNetworkName(), [address]);

    const handleCopy = useCallback(() => {
      if (address) navigator.clipboard.writeText(address);
    }, [address]);

    if (isLoading) {
      return (
        <Button variant="outline" disabled className={className}>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Connecting...
        </Button>
      );
    }

    if (isConnected && address) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className={className}>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <Wallet className="h-4 w-4" />
              <span>{shortAddress}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">
              Connected to {networkName}
            </div>

            <div className="px-2 py-1.5 text-xs text-muted-foreground break-all">
              {address}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <NetworkSwitcher />
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleCopy}>
              Copy Address
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={disconnect}
              className="text-red-600"
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        onClick={connectWallet}
        className={`bg-gradient-to-r from-primary to-primary-glow ${className}`}
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }
);
