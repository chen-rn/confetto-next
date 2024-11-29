"use client";

import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { transcriptionEntriesAtom } from "@/lib/atoms/interview";

export function TranscriptionDisplay() {
  const [entries] = useAtom(transcriptionEntriesAtom);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries come in
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center p-3 sm:p-4 border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#635BFF]" />
          <h3 className="text-sm sm:text-base font-medium text-neutral-900">Live Conversation</h3>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {entries.reduce((acc, entry, i) => {
          const isConsecutive = i > 0 && entries[i - 1].speaker === entry.speaker;
          
          if (isConsecutive) {
            // Append text to the previous entry without extra newlines
            const lastEntry = acc[acc.length - 1];
            lastEntry.text += " " + entry.text;
            return acc;
          } else {
            // Create new entry
            acc.push({...entry});
            return acc;
          }
        }, [] as typeof entries).map((entry, i) => {
          const isAI = entry.speaker === "AI Interviewer";
          return (
            <div key={entry.timestamp} className={`space-y-1.5 ${isAI ? "pr-12" : "pl-12"}`}>
              <div className={`text-xs font-medium text-neutral-500 mb-1 ${isAI ? "" : "text-right"}`}>
                {isAI ? "AI Interviewer" : "You"}
              </div>
              <div className={`text-sm text-neutral-900 ${
                isAI 
                  ? "bg-[#635BFF]/5 rounded-xl rounded-bl-none" 
                  : "bg-neutral-100 rounded-xl rounded-br-none"
              } p-3`}>
                {entry.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
