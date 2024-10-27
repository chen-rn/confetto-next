interface OnboardingProgressProps {
  currentStep: number;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const steps = [
    { label: "Profile", step: 0 },
    { label: "Preferences", step: 1 },
    { label: "School", step: 2 },
    { label: "Trial", step: 3 },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-muted-foreground">
          {Math.round((currentStep / steps.length) * 100)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
