import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TokenSelection } from "./TokenSelection";
import { AllocationSettings } from "./AllocationSettings";
import { VolatilityThreshold } from "./VolatilityThreshold";
import { ReviewConfirm } from "./ReviewConfirm";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { useFactoryVaultWrite, useFactoryVaultData } from "@/hooks/useContracts";
import { useAccount } from "wagmi";
import { parseEther } from "viem";

export interface VaultConfig {
  tokens: string[];
  allocations: Record<string, number>;
  volatilityThreshold: number;
}

const STEPS = [
  { id: 1, title: "Select Tokens", description: "Choose tokens for your portfolio" },
  { id: 2, title: "Set Allocations", description: "Define target allocation percentages" },
  { id: 3, title: "Volatility Threshold", description: "Configure rebalancing trigger" },
  { id: 4, title: "Review & Confirm", description: "Review and create your vault" },
];

interface VaultCreationWizardProps {
  onComplete?: () => void;
}

export function VaultCreationWizard({ onComplete }: VaultCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<VaultConfig>({
    tokens: [],
    allocations: {},
    volatilityThreshold: 30,
  });

  const { address, isConnected } = useAccount();
  const { creationFeeRaw } = useFactoryVaultData();
  const { createVault, isPending, isSuccess, error } = useFactoryVaultWrite();

  const updateConfig = (updates: Partial<VaultConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return config.tokens.length >= 2;
      case 2:
        const totalAllocation = Object.values(config.allocations).reduce((a, b) => a + b, 0);
        return Math.abs(totalAllocation - 100) < 0.01;
      case 3:
        return config.volatilityThreshold > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet");
      return;
    }

    try {
      // Create vault with factory
      await createVault(creationFeeRaw);
      
      // Wait for transaction to complete
      // In production, you'd wait for transaction confirmation
      // and then associate tokens, set allocations, etc.
      
      console.log("Vault created with config:", config);
      
      // TODO: After vault creation:
      // 1. Get the new vault address from factory
      // 2. Associate tokens with the vault
      // 3. Store allocation and threshold settings (in contract or off-chain)
      
    } catch (err) {
      console.error("Vault creation failed:", err);
    }
  };

  // Show success state
  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Vault Created Successfully!</h3>
              <p className="text-muted-foreground">
                Your vault has been deployed. You can now associate tokens and start depositing.
              </p>
              <Button onClick={onComplete} className="mt-4">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-[2px] flex-1 mx-2 transition-colors ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && <TokenSelection config={config} updateConfig={updateConfig} />}
          {currentStep === 2 && <AllocationSettings config={config} updateConfig={updateConfig} />}
          {currentStep === 3 && <VolatilityThreshold config={config} updateConfig={updateConfig} />}
          {currentStep === 4 && <ReviewConfirm config={config} creationFee={creationFeeRaw} />}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mt-4 border-red-500">
          <CardContent className="py-4">
            <p className="text-sm text-red-600">
              Error: {error.message || "Failed to create vault. Please try again."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isPending}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} disabled={!canProceed() || isPending}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            disabled={!canProceed() || isPending || !isConnected}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Vault...
              </>
            ) : (
              "Create Vault"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}