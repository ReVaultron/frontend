// components/app/AppContent.tsx
import React from "react";
import { useAppKitContext } from "@/contexts/AppKitContext";
import { LoadingScreen } from "../common/LoadingScreen";
import { ErrorScreen } from "../common/ErrorBanner";
import { AppRoutes } from "../routing/AppRoutes";

export const AppContent: React.FC = () => {
  const { isInitialized, error } = useAppKitContext();

  if (error) {
    return (
      <ErrorScreen 
        error={error}
        title="Initialization Error"
        subtitle="Please check your WalletConnect Project ID or try refreshing the page."
      />
    );
  }

  if (!isInitialized) {
    return (
      <LoadingScreen 
        message="Initializing wallet connections..." 
        subtitle="Detecting available wallets..."
      />
    );
  }

  return <AppRoutes />;
};