import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getTags } from "@/lib/actions/getTags";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { QuestionTag } from "@prisma/client";

interface TopicSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (tagId: string) => Promise<void>;
}

export function TopicSelectModal({ isOpen, onClose, onSelectTopic }: TopicSelectModalProps) {
  const { data: tags, isLoading } = useQuery({
    queryKey: ["topicTags"],
    queryFn: () => getTags(),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Interview Topic</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {isLoading ? (
            <div className="col-span-2 flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            tags?.map((tag: QuestionTag) => (
              <Button
                key={tag.id}
                variant="outline"
                className={cn(
                  "h-auto py-4 px-3 flex flex-col gap-1",
                  "hover:border-primary/50 transition-colors"
                )}
                onClick={() => onSelectTopic(tag.id)}
              >
                <span className="font-semibold">{tag.name}</span>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
