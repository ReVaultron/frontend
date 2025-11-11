// context/AppKitContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { AppKit } from "@reown/appkit";
import type UniversalProvider from "@walletconnect/universal-provider";
import { initializeAppKit } from "../services/appkitService";

interface AppKitContextType {
  isInitialized: boolean;
  appKit: AppKit | null;
  universalProvider: UniversalProvider | null;
  error: string | null;
}

const AppKitContext = createContext<AppKitContextType | null>(null);

export const useAppKitContext = () => {
  const context = useContext(AppKitContext);
  if (!context) {
    throw new Error("useAppKitContext must be used within AppKitProvider");
  }
  return context;
};

interface AppKitProviderProps {
  children: ReactNode;
}

export const AppKitProvider: React.FC<AppKitProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [appKit, setAppKit] = useState<AppKit | null>(null);
  const [universalProvider, setUniversalProvider] =
    useState<UniversalProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('appKit', appKit)

  useEffect(() => {
    const initialize = async () => {
      try {
        const { appKit: appKitInstance, universalProvider: provider } =
          await initializeAppKit();

        setAppKit(appKitInstance);
        setUniversalProvider(provider);
        setIsInitialized(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize AppKit";
        console.error("❌ Failed to initialize AppKit:", err);
        setError(errorMessage);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initialize, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppKitContext.Provider
      value={{ isInitialized, appKit, universalProvider, error }}
    >
      {children}
    </AppKitContext.Provider>
  );
};
