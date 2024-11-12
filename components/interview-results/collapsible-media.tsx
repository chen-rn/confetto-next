"use client";

import { ChevronDown, Video, Mic } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleMediaProps {
  videoUrl?: string | null;
  audioUrl?: string | null;
}

export function CollapsibleMedia({ videoUrl, audioUrl }: CollapsibleMediaProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-[#635BFF]/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between bg-white p-4 text-left transition-colors hover:bg-neutral-50"
      >
        <div className="flex items-center gap-3">
          {videoUrl ? (
            <Video className="h-4 w-4 text-[#635BFF]" />
          ) : (
            <Mic className="h-4 w-4 text-[#635BFF]" />
          )}
          <div>
            <h3 className="font-medium text-[#635BFF]">Recording</h3>
            <p className="text-xs text-muted-foreground">
              {videoUrl ? "Video response" : "Audio response"}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-400 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "transition-all duration-200 ease-out",
          isExpanded ? "max-h-[600px]" : "max-h-0"
        )}
      >
        <div className="border-t border-[#635BFF]/10 bg-gradient-to-br from-[#635BFF]/5 p-4">
          {videoUrl ? (
            <video src={videoUrl} controls className="w-full overflow-hidden rounded-lg" />
          ) : (
            <audio src={audioUrl!} controls className="w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
