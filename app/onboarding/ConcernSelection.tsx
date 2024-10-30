import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutTemplate, Clock, Scale, UserRound, MessageSquare } from "lucide-react";

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
    icon: LayoutTemplate,
  },
  {
    id: "time",
    label: "Managing time pressure",
    description: "Help me pace my responses and use the time effectively",
    icon: Clock,
  },
  {
    id: "ethics",
    label: "Handling ethical scenarios",
    description: "Help me navigate complex ethical situations with confidence",
    icon: Scale,
  },
  {
    id: "professionalism",
    label: "Maintaining professionalism",
    description: "Help me present myself professionally throughout the interview",
    icon: UserRound,
  },
  {
    id: "communication",
    label: "Communicating clearly",
    description: "Help me express my thoughts clearly and effectively",
    icon: MessageSquare,
  },
];

export function ConcernSelection({
  data,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: ConcernSelectionProps) {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    data.primaryConcern ? [data.primaryConcern] : []
  );

  const toggleConcern = (id: string) => {
    setSelectedConcerns((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900">What are your biggest concerns?</h1>
        <p className="text-sm text-muted-foreground">
          Select all that apply to personalize your experience
        </p>
      </div>

      <ScrollArea className="h-[320px] -mx-2 px-2">
        <div className="space-y-2">
          {CONCERNS.map((concern) => {
            const Icon = concern.icon;
            const isSelected = selectedConcerns.includes(concern.id);
            return (
              <div
                key={concern.id}
                onClick={() => toggleConcern(concern.id)}
                className={cn(
                  "group flex items-start space-x-3 rounded-xl border p-3 transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-[#635BFF] bg-[#635BFF]/[0.02] shadow-sm ring-1 ring-[#635BFF]/10"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm hover:bg-gray-50/50 bg-white"
                )}
              >
                <div className="flex-shrink-0">
                  <Checkbox
                    id={concern.id}
                    checked={isSelected}
                    className={cn(
                      "mt-0.5 transition-all duration-200",
                      "data-[state=checked]:bg-[#635BFF] data-[state=checked]:border-[#635BFF]",
                      "border-gray-200",
                      "group-hover:border-[#635BFF]",
                      "focus-visible:ring-1 focus-visible:ring-[#635BFF]"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <div
                      className={cn(
                        "p-0.5 rounded-md transition-colors",
                        isSelected ? "bg-[#635BFF]/10" : "group-hover:bg-gray-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 flex-shrink-0 transition-colors duration-200",
                          isSelected ? "text-[#635BFF]" : "text-gray-400 group-hover:text-[#635BFF]"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "font-medium truncate transition-colors duration-200 text-sm",
                        isSelected ? "text-[#635BFF]" : "text-gray-900 group-hover:text-[#635BFF]"
                      )}
                    >
                      {concern.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed pl-6">
                    {concern.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex justify-between pt-3">
        <Button variant="outline" onClick={onBack} disabled={isFirstStep}>
          Back
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{selectedConcerns.length} selected</span>
          <Button
            onClick={() => onNext({ primaryConcern: selectedConcerns[0] })}
            disabled={selectedConcerns.length === 0}
            className="bg-[#635BFF] hover:bg-[#635BFF]/90"
          >
            {isLastStep ? "Complete Setup" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
