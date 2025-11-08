import { useState } from "react";
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock wallet data - replace with actual Hedera wallet integration
const MOCK_ACCOUNT = "0.0.123456";
const MOCK_BALANCE = "0.28";

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const handleConnect = async () => {
    // TODO: Implement actual Hedera wallet connection
    // Using HashPack or Blade wallet
    try {
      // Simulate connection
      setIsConnected(true);
      setAccountId(MOCK_ACCOUNT);
      setBalance(MOCK_BALANCE);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccountId(null);
    setBalance(null);
    setShowDropdown(false);
  };

  const copyAddress = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
      // TODO: Show toast notification
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30"
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium hidden sm:inline">
            {balance} HBAR
          </span>
        </div>
        <div className="px-3 py-1 bg-background rounded-md">
          <span className="text-sm font-mono">
            {accountId && formatAddress(accountId)}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          showDropdown && "rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Account Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Account</span>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Connected
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{accountId}</span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  aria-label="Copy address"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Balance */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="text-sm font-semibold">{balance} HBAR</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  // TODO: Open explorer
                  window.open(`https://hashscan.io/testnet/account/${accountId}`, '_blank');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on HashScan
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}