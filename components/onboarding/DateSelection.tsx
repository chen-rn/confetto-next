import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { addDays } from "date-fns";

interface DateSelectionProps {
  data: {
    mmiDate: Date | null;
  };
  onNext: (data: { mmiDate: Date | null }) => void;
  onBack: () => void;
  isFirstStep: boolean;
}

export function DateSelection({ data, onNext, isFirstStep }: DateSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(
    data.mmiDate ? new Date(data.mmiDate) : undefined
  );
  const [noDate, setNoDate] = useState(false);

  const handleNext = () => {
    onNext({ mmiDate: date ? new Date(date) : null });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">When is your MMI interview?</h1>
        <p className="text-muted-foreground">This helps us personalize your practice schedule</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(date) => date < new Date() || date > addDays(new Date(), 365)}
          className={noDate ? "opacity-50 pointer-events-none" : ""}
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="no-date"
            checked={noDate}
            onChange={(e) => setNoDate(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="no-date" className="text-sm text-muted-foreground">
            I don't have a date yet
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={handleNext} disabled={!date && !noDate}>
          Continue
        </Button>
      </div>
    </div>
  );
}
