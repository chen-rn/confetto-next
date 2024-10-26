"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ConcernSelectionProps {
  data: {
    primaryConcern: string | null;
  };
  onNext: (data: { primaryConcern: string }) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const CONCERNS = [
  {
    id: "structuring",
    label: "Structuring my responses",
    description: "Help me organize my thoughts and deliver clear, structured answers",
  },
  {
    id: "time",
    label: "Managing time pressure",
    description: "Help me pace my responses and use the time effectively",
  },
  {
    id: "ethics",
    label: "Handling ethical scenarios",
    description: "Help me navigate complex ethical situations with confidence",
  },
  {
    id: "professionalism",
    label: "Maintaining professionalism",
    description: "Help me present myself professionally throughout the interview",
  },
  {
    id: "communication",
    label: "Communicating clearly",
    description: "Help me express my thoughts clearly and effectively",
  },
];

export function ConcernSelection({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: ConcernSelectionProps) {
  const [selectedConcern, setSelectedConcern] = useState<string>(data.primaryConcern || "");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">What's your biggest concern?</h1>
        <p className="text-muted-foreground">This helps us personalize your practice experience</p>
      </div>

      <RadioGroup value={selectedConcern} onValueChange={setSelectedConcern} className="space-y-3">
        {CONCERNS.map((concern) => (
          <div key={concern.id} className="flex items-start space-x-3">
            <RadioGroupItem value={concern.id} id={concern.id} />
            <Label htmlFor={concern.id} className="grid gap-1 leading-none">
              <span>{concern.label}</span>
              <span className="text-sm text-muted-foreground">{concern.description}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isFirstStep}>
          Back
        </Button>
        <Button
          onClick={() => onNext({ primaryConcern: selectedConcern })}
          disabled={!selectedConcern}
        >
          {isLastStep ? "Complete Setup" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
