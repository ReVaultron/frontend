import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/provider/ThemeProvider";
import { AppKitProvider } from "./contexts/AppKitContext";
import { AppContent } from "./components/app/AppContent";
import { Web3Provider } from "./components/provider/Web3Provider";

const App = () => (
  <ThemeProvider>
    <Web3Provider>
      <AppKitProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AppKitProvider>
    </Web3Provider>
  </ThemeProvider>
);

export default App;

// Re-export the context hook for backwards compatibility
export { useAppKitContext } from "./contexts/AppKitContext";
