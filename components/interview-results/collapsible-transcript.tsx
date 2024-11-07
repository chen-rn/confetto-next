"use client";

import { ChevronDown, FileText } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleTranscriptProps {
  transcript: string;
}

export function CollapsibleTranscript({ transcript }: CollapsibleTranscriptProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#635BFF]/10 bg-white p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#635BFF]" />
            <h3 className="font-semibold">Response Transcript</h3>
          </div>
          <CollapsibleTrigger asChild>
            <button className="rounded-lg p-2 hover:bg-neutral-100">
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "transform rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        {/* Preview text (always visible) */}
        <p
          className={cn(
            "text-sm leading-relaxed text-neutral-600 line-clamp-3",
            isOpen && "hidden"
          )}
        >
          {transcript}
        </p>

        <CollapsibleContent className="transition-all duration-200">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
            {transcript}
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
