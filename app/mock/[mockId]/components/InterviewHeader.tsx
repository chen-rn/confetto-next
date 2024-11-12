import { Button } from "@/components/ui/button";
import { Mic, Video, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

interface InterviewHeaderProps {
  questionType: string;
  tags: { id: string; name: string; type: string }[];
  showQuestion?: boolean;
}

export function InterviewHeader({ questionType, tags, showQuestion }: InterviewHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {showQuestion ? (
            <div className="flex items-center justify-center gap-4 w-full relative">
              <Link href={ROUTES.HOME} className="absolute left-4">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-neutral-900">MMI Station</h1>
                <div className="flex gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF]"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-neutral-900">{questionType} Interview</h1>
              <div className="flex items-center gap-4">
                {/*     <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  <Video className="h-4 w-4" />
                </Button> */}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
