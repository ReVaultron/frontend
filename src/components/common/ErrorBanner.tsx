// components/common/ErrorScreen.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  error: string | null;
  className?: string;
}
interface ErrorScreenProps {
  error: string;
  title?: string;
  subtitle?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  error,
  className,
}) => {
  if (!error) return null;

  return (
    <div
      className={`p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span>Error: {error}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-red-400 hover:text-red-300"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  error,
  title = "Initialization Error",
  subtitle = "Please check your WalletConnect Project ID or try refreshing the page.",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{title}</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};
