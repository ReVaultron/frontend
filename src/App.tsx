import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DashboardLayout } from "@/components/layout/Layout";
import Dashboard from "./pages/Index";
import Analytics from "./pages/Analytics";
import VaultDetails from "./pages/VaultDetails";
import NotFound from "./pages/NotFound";
import { AppKitProvider } from "./contexts/AppKitContext";
import { AppContent } from "./components/app/AppContent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppKitProvider>
          <AppContent />
        </AppKitProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

// Re-export the context hook for backwards compatibility
export { useAppKitContext } from "./contexts/AppKitContext";