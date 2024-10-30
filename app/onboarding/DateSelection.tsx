import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface DateSelectionProps {
  data: {
    mmiDate: Date | null;
  };
  onNext: (data: { mmiDate: Date | null }) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function DateSelection({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: DateSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(
    data.mmiDate ? new Date(data.mmiDate) : undefined
  );
  const [noDate, setNoDate] = useState(false);

  const handleNext = () => {
    onNext({ mmiDate: date ? new Date(date) : null });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900">When is your MMI interview?</h1>
        <p className="text-sm text-muted-foreground">
          We'll help you prepare with a personalized schedule
        </p>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(date) => date < new Date() || date > addDays(new Date(), 365)}
          className={cn(
            "rounded-xl border shadow-sm p-3",
            noDate ? "opacity-50 pointer-events-none" : ""
          )}
        />
      </div>

      <div className="flex items-center space-x-2 justify-center">
        <input
          type="checkbox"
          id="no-date"
          checked={noDate}
          onChange={(e) => setNoDate(e.target.checked)}
          className="rounded border-gray-300 text-[#635BFF] focus:ring-[#635BFF]"
        />
        <label htmlFor="no-date" className="text-sm text-muted-foreground">
          I don't have a date yet
        </label>
      </div>

      <div className="flex justify-between pt-3">
        <Button variant="outline" onClick={onBack} disabled={isFirstStep}>
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!date && !noDate}
          className="bg-[#635BFF] hover:bg-[#635BFF]/90"
        >
          {isLastStep ? "Complete Setup" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
