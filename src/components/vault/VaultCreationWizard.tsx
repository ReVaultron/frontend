import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TokenSelection } from "./TokenSelection";
import { AllocationSettings } from "./AllocationSettings";
import { VolatilityThreshold } from "./VolatilityThreshold";
import { ReviewConfirm } from "./ReviewConfirm";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const handleComplete = () => {
    // TODO: Implement vault creation
    console.log("Creating vault with config:", config);
    onComplete?.();
  };

  return (
    <div className="max-w-4xl mx-auto">
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
          {currentStep === 4 && <ReviewConfirm config={config} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={!canProceed()}>
            Create Vault
          </Button>
        )}
      </div>
    </div>
  );
}
