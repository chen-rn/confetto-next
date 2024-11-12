"use client";

import { ChevronDown, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleTranscriptProps {
  transcript: string;
}

export function CollapsibleTranscript({ transcript }: CollapsibleTranscriptProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-[#635BFF]/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-white p-4 text-left transition-colors hover:bg-neutral-50"
      >
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-[#635BFF]" />
          <div>
            <h3 className="font-medium text-[#635BFF]">Transcript</h3>
            <p className="text-xs text-muted-foreground">Written response</p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn("transition-all duration-200 ease-out", isOpen ? "max-h-[600px]" : "max-h-0")}
      >
        <div className="border-t border-[#635BFF]/10 bg-gradient-to-br from-[#635BFF]/5 p-4">
          <p className="text-sm leading-relaxed text-neutral-600">{transcript}</p>
        </div>
      </div>
    </div>
  );
}
