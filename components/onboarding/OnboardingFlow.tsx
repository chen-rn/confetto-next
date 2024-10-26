"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateSelection } from "./DateSelection";
import { SchoolSelection } from "./SchoolSelection";
import { ConcernSelection } from "./ConcernSelection";
import { OnboardingProgress } from "./OnboardingProgress";
import { updateOnboarding } from "@/lib/actions/onboarding";
import type { School } from "@prisma/client";

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
  schools?: School[]; // Changed from Pick<School, "id">[]
  primaryConcern?: string | null;
};

export function OnboardingFlow({ initialData }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    mmiDate: initialData?.mmiDate || null,
    schools: initialData?.schools || [],
    primaryConcern: initialData?.primaryConcern || null,
  });

  const steps = {
    1: DateSelection,
    2: SchoolSelection,
    3: ConcernSelection,
  };

  const CurrentStep = steps[step as keyof typeof steps];

  const handleNext = async (stepData: StepData) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    if (step === 3) {
      // Final step
      await updateOnboarding(updatedData);
      router.push("/dashboard");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-8">
      <OnboardingProgress currentStep={step} totalSteps={3} />

      <CurrentStep
        data={formData}
        onNext={handleNext}
        onBack={handleBack}
        isFirstStep={step === 1}
        isLastStep={step === 3}
      />
    </div>
  );
}
