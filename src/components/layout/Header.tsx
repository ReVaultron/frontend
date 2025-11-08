import { Shield, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../ThemeToggle";
import { WalletConnect } from "../WalletConnect";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ReVaultron
            </span>
          </Link>
        </div>

        {/* Right: Theme Toggle + Wallet */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}