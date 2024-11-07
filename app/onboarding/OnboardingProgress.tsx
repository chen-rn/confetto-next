import { cn } from "@/lib/utils";
import { User, School, Target, Rocket } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const steps = [
    { label: "Profile", step: 0, icon: User },
    { label: "Schools", step: 1, icon: School },
    { label: "Goals", step: 2, icon: Target },
    { label: "Trial", step: 3, icon: Rocket },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-[#635BFF]">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
        </span>
      </div>

      <div className="flex justify-between relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all",
                  index <= currentStep ? "bg-[#635BFF] text-white" : "bg-neutral-100 text-neutral-400"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  index <= currentStep ? "text-[#635BFF]" : "text-neutral-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}

        {/* Progress line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-neutral-100 -z-0">
          <div
            className="h-full bg-[#635BFF] transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
