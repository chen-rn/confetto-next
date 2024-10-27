"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateSelection } from "./DateSelection";
import { SchoolSelection } from "../../components/onboarding/SchoolSelection";
import { ConcernSelection } from "./ConcernSelection";
import { OnboardingProgress } from "../../components/onboarding/OnboardingProgress";
import { updateOnboarding } from "@/lib/actions/onboarding";
import type { School } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { OnboardingStatus } from "@prisma/client";

interface OnboardingFlowProps {
  initialData: {
    schools: School[];
    mmiDate: Date | null;
    primaryConcern: string | null;
  } | null;
}

type FormData = {
  mmiDate: Date | null;
  schools: School[];
  primaryConcern: string | null;
};

type StepData = {
  mmiDate?: Date | null;
  schools?: School[];
  primaryConcern?: string | null;
};

// Add type for non-trial steps
type NonTrialStep = 0 | 1 | 2;
type StepType = NonTrialStep | 3;

const STEPS = {
  PROFILE: 0,
  PREFERENCES: 1,
  SCHOOL: 2,
  TRIAL: 3,
} as const;

export function OnboardingFlow({ initialData }: OnboardingFlowProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<StepType>(STEPS.PROFILE);
  const [formData, setFormData] = useState<FormData>({
    mmiDate: initialData?.mmiDate || null,
    schools: initialData?.schools || [],
    primaryConcern: initialData?.primaryConcern || null,
  });

  const steps = {
    [STEPS.PROFILE]: DateSelection,
    [STEPS.PREFERENCES]: SchoolSelection,
    [STEPS.SCHOOL]: ConcernSelection,
  } as const;

  // Fix the type checking by asserting step is NonTrialStep when accessing steps
  const CurrentStep = step < STEPS.TRIAL ? steps[step as NonTrialStep] : null;

  const handleNext = async (stepData: StepData) => {
    try {
      const updatedData = { ...formData, ...stepData };
      setFormData(updatedData);

      if (step === STEPS.SCHOOL) {
        // Update onboarding status before moving to trial
        await updateOnboarding({
          ...updatedData,
          onboardingStatus: OnboardingStatus.COMPLETED,
        });
        setStep(STEPS.TRIAL);
      } else if (step === STEPS.TRIAL) {
        router.push("/trial");
      } else {
        setStep((prev) => (prev + 1) as StepType);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (step > STEPS.PROFILE) {
      setStep((prev) => (prev - 1) as StepType);
    }
  };

  return (
    <div className="space-y-8">
      <OnboardingProgress currentStep={step} />

      {step === STEPS.TRIAL ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">One Last Step!</h2>
          <p className="text-muted-foreground text-center">
            Start your free trial to access all features and begin your interview preparation
            journey.
          </p>
          <Button onClick={() => router.push("/pricing")}>Start Free Trial</Button>
        </div>
      ) : CurrentStep ? (
        <CurrentStep
          data={formData}
          onNext={handleNext}
          onBack={handleBack}
          isFirstStep={step === STEPS.PROFILE}
          isLastStep={step === STEPS.SCHOOL}
        />
      ) : null}
    </div>
  );
}
