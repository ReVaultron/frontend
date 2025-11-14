// context/AppKitContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
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
  const ctx = useContext(AppKitContext);
  if (!ctx) throw new Error("useAppKitContext must be used within provider");
  return ctx;
};

export const AppKitProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppKitContextType>({
    isInitialized: false,
    appKit: null,
    universalProvider: null,
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await initializeAppKit();
        setState({
          isInitialized: true,
          appKit: res.appKit,
          universalProvider: res.universalProvider,
          error: null,
        });
      } catch (err: any) {
        setState((prev) => ({ ...prev, error: err.message }));
      }
    })();
  }, []);

  return (
    <AppKitContext.Provider value={state}>
      {children}
    </AppKitContext.Provider>
  );
};
