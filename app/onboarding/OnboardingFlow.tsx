"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateSelection } from "./DateSelection";
import { ConcernSelection } from "./ConcernSelection";
import { updateOnboarding } from "@/lib/actions/onboarding";
import type { School } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { OnboardingStatus } from "@prisma/client";
import { SchoolSelection } from "./SchoolSelection";
import { OnboardingProgress } from "./OnboardingProgress";
import {
  Rocket,
  Check,
  Sparkles,
  VideoIcon,
  SparklesIcon,
  BookOpenIcon,
  LineChartIcon,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [step, setStep] = useState<StepType>(STEPS.PROFILE);
  const [formData, setFormData] = useState<FormData>({
    mmiDate: initialData?.mmiDate || null,
    schools: initialData?.schools || [],
    primaryConcern: initialData?.primaryConcern || null,
  });
  const [isTrialLoading, setIsTrialLoading] = useState(false);

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
        // Just move to trial step without saving
        setStep(STEPS.TRIAL);
      } else if (step === STEPS.TRIAL) {
        // When they complete trial, send them to pricing
        router.push("/pricing?redirect=/welcome");
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

  const handleStartTrial = async () => {
    setIsTrialLoading(true);
    try {
      // Save all the data when they click the trial button
      await updateOnboarding({
        ...formData,
        onboardingStatus: OnboardingStatus.COMPLETED,
      });
      router.push("/pricing");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTrialLoading(false);
    }
  };

  const handleBack = () => {
    if (step > STEPS.PROFILE) {
      setStep((prev) => (prev - 1) as StepType);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border shadow-sm p-8">
      {/* Only show progress when not on trial step */}
      {step !== STEPS.TRIAL && <OnboardingProgress currentStep={step} />}

      {step === STEPS.TRIAL ? (
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="relative animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[#635BFF]/10 flex items-center justify-center">
              <Rocket className="h-10 w-10 text-[#635BFF] animate-float" />
            </div>
            <div className="absolute -top-1 -right-1 animate-pulse">
              <Sparkles className="h-5 w-5 text-[#635BFF]" />
            </div>
          </div>

          <div className="text-center space-y-3 max-w-md">
            <div className="flex justify-center gap-2">
              <Badge
                variant="secondary"
                className="bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/20 animate-fade-in"
              >
                <Check className="mr-1 h-3 w-3" /> Profile Complete
              </Badge>
            </div>

            <h2 className="text-2xl font-bold text-neutral-900">Your Journey Begins Here</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You're all set to start practicing. Begin your free trial to access everything you
              need to ace your MMI interview.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6 max-w-lg mx-auto text-left">
              {[
                {
                  title: "Practice Interviews",
                  desc: "Unlimited mock interviews with real MMI scenarios",
                  icon: VideoIcon,
                },
                {
                  title: "AI Analysis",
                  desc: "Get instant feedback on your performance",
                  icon: SparklesIcon,
                },
                {
                  title: "Question Bank",
                  desc: "Access our curated database of MMI questions",
                  icon: BookOpenIcon,
                },
                {
                  title: "Progress Tracking",
                  desc: "Monitor your improvement over time",
                  icon: LineChartIcon,
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-[#635BFF]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-neutral-900">{feature.title}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm mt-4">
            <Button
              onClick={handleStartTrial}
              disabled={isTrialLoading}
              className="bg-[#635BFF] hover:bg-[#635BFF]/90 w-full h-12 text-base rounded-full relative overflow-hidden"
            >
              {isTrialLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up your trial...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Start 7-Day Free Trial
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Join hundreds of successful medical students
            </p>
          </div>
        </div>
      ) : CurrentStep ? (
        <div className="mt-8">
          <CurrentStep
            data={formData}
            onNext={handleNext}
            onBack={handleBack}
            isFirstStep={step === STEPS.PROFILE}
            isLastStep={step === STEPS.SCHOOL}
          />
        </div>
      ) : null}
    </div>
  );
}
