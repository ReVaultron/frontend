import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppKitProvider } from "./contexts/AppKitContext";
import { AppContent } from "./components/app/AppContent";
import { Web3Provider } from "./components/provider/Web3Provider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <Web3Provider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppKitProvider>
            <AppContent />
          </AppKitProvider>
        </TooltipProvider>
      </Web3Provider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

// Re-export the context hook for backwards compatibility
export { useAppKitContext } from "./contexts/AppKitContext";
