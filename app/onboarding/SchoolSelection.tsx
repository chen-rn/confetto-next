import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SchoolSelector } from "@/components/SchoolSelector";
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
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900">Select Your Target Schools</h1>
        <p className="text-sm text-muted-foreground">
          Choose the medical schools you're applying to
        </p>
      </div>

      <div className="h-[320px]">
        <SchoolSelector
          selectedSchools={selectedSchools}
          onSchoolToggle={handleSchoolToggle}
          onSchoolRemove={handleSchoolRemove}
        />
      </div>

      <div className="flex justify-between pt-3">
        <Button variant="outline" onClick={onBack} disabled={isFirstStep}>
          Back
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{selectedSchools.length} selected</span>
          <div className="space-x-2">
            <Button
              variant="ghost"
              onClick={() => onNext({ schools: [] })}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip
            </Button>
            <Button
              onClick={() => onNext({ schools: selectedSchools })}
              className="bg-[#635BFF] hover:bg-[#635BFF]/90"
            >
              {isLastStep ? "Complete Setup" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
