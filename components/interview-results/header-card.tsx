import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { SectionCard } from "./shared/section-card";
import { FileText } from "lucide-react";

interface HeaderCardProps {
  question: string;
}

export function HeaderCard({ question }: HeaderCardProps) {
  return (
    <SectionCard title="Interview Results" subtitle={question} icon={FileText}>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Play className="h-4 w-4" /> Replay Recording
        </Button>
      </div>
    </SectionCard>
  );
}
