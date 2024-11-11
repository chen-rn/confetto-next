import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

interface InterviewControlsProps {
  interviewTimeLeft: number;
  question: string;
  onEndInterview: () => void;
  isProcessing: boolean;
  formatTime: (seconds: number) => string;
}

export function InterviewControls({
  interviewTimeLeft,
  question,
  onEndInterview,
  isProcessing,
  formatTime,
}: InterviewControlsProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">Interview Progress</span>
          <div className="w-14 h-14 lg:w-16 lg:h-16">
            <CircularProgressbar
              value={((480 - interviewTimeLeft) / 480) * 100}
              text={formatTime(interviewTimeLeft)}
              styles={buildStyles({
                textSize: "1rem",
                pathColor: interviewTimeLeft < 60 ? "#ef4444" : "#635BFF",
                textColor: "#1f2937",
              })}
            />
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 hidden sm:block">
          <div className="font-medium text-sm text-neutral-600">Question</div>
          <p className="text-sm text-neutral-900">{question}</p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-neutral-700 font-medium">Recording in progress</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1 hidden sm:block">
            Video and audio are being recorded
          </div>
        </div>

        <Button
          onClick={onEndInterview}
          disabled={isProcessing}
          variant="outline"
          className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          End Interview
        </Button>
      </CardContent>
    </Card>
  );
}
