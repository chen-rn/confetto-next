"use client";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { CardTitle } from "./ui/card";

export function CollapsibleTranscription({ transcription }: { transcription: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CardTitle>Transcription</CardTitle>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Expand
              </>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <p className="text-base whitespace-pre-wrap mt-2">{transcription}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
