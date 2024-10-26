"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SchoolSelector } from "@/components/shared/SchoolSelector";
import type { School } from "@prisma/client";

interface SchoolSelectionProps {
  data: {
    schools: School[];
  };
  onNext: (data: { schools: School[] }) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function SchoolSelection({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: SchoolSelectionProps) {
  const [selectedSchools, setSelectedSchools] = useState<School[]>(data.schools);

  const handleSchoolToggle = (school: School) => {
    setSelectedSchools((current) => {
      const exists = current.find((s) => s.id === school.id);
      if (exists) {
        return current.filter((s) => s.id !== school.id);
      }
      return [...current, school];
    });
  };

  const handleSchoolRemove = (schoolId: string) => {
    setSelectedSchools((current) => current.filter((s) => s.id !== schoolId));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Select Your Target Schools</h1>
        <p className="text-muted-foreground">Choose the medical schools you're applying to</p>
      </div>

      <SchoolSelector
        selectedSchools={selectedSchools}
        onSchoolToggle={handleSchoolToggle}
        onSchoolRemove={handleSchoolRemove}
      />

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isFirstStep}>
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="ghost" onClick={() => onNext({ schools: [] })}>
            Skip
          </Button>
          <Button onClick={() => onNext({ schools: selectedSchools })}>Continue</Button>
        </div>
      </div>
    </div>
  );
}
