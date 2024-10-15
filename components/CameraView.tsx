"use client";

import { useMediaSetup } from "@/hooks/useMediaSetup";
import { useRecording } from "@/hooks/useRecording";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/utils/formatTime";
import { useToast } from "@/hooks/use-toast";

interface CameraViewProps {
  mockId: string;
  maxRecordingTime?: number;
  question: string;
}

export function CameraView({ mockId, maxRecordingTime = 300, question }: CameraViewProps) {
  const { hasPermission, error, videoRef } = useMediaSetup();
  const {
    isRecording,
    remainingTime,
    isProcessing,
    startRecording,
    stopRecording,
    isCountingDown,
    countdownTime,
  } = useRecording(mockId, maxRecordingTime);
  const { toast } = useToast();

  const handleStartInterview = async () => {
    try {
      if (!isRecording && videoRef.current?.srcObject) {
        console.log("Starting interview");
        await startRecording(videoRef.current.srcObject as MediaStream);
      } else {
        throw new Error("Unable to start interview");
      }
    } catch (error) {
      console.error("Interview start error:", error);
      toast({
        title: "Interview start error",
        description:
          (error as Error).message ||
          "There was an issue starting the interview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAnswer = async () => {
    try {
      console.log("Submitting answer");
      await stopRecording();
      toast({
        title: "Answer submitted",
        description: "Your answer is being processed. Please wait.",
      });
    } catch (error) {
      console.error("Answer submission error:", error);
      toast({
        title: "Submission error",
        description:
          (error as Error).message ||
          "There was an issue submitting your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-100">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg transform scale-x-[-1]"
      />

      {/* Question Overlay - Only shown before recording starts */}
      {!isRecording && !isProcessing && (
        <div className="absolute inset-0 flex flex-col items-center justify-start p-4 bg-black bg-opacity-50 text-white overflow-y-auto">
          <div className="max-w-2xl w-full bg-gray-800 bg-opacity-75 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Question:</h2>
            <p className="text-lg">{question}</p>
          </div>
        </div>
      )}

      {/* Error and Permission States */}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-gray-100">
          <p className="text-red-500">{error}</p>
          <p>
            Please ensure you're using a supported browser and have granted the necessary
            permissions.
          </p>
        </div>
      ) : hasPermission === null ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          Requesting camera and microphone permission...
        </div>
      ) : (
        hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            Access denied. Please enable camera and microphone permissions.
          </div>
        )
      )}

      {/* Timer */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-lg font-semibold">
        {formatTime(remainingTime)}
      </div>

      {/* Interview Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        {!isRecording && !isProcessing && (
          <Button
            variant="default"
            onClick={handleStartInterview}
            className="px-8 py-4 text-md mb-2"
          >
            Start Interview
          </Button>
        )}
        {isRecording && (
          <Button
            variant="destructive"
            onClick={handleSubmitAnswer}
            className="px-8 py-4 text-md mb-2"
          >
            Submit Answer
          </Button>
        )}
        {isProcessing && (
          <div className="text-white text-lg font-semibold">Processing your answer...</div>
        )}
      </div>

      {/* Countdown Overlay */}
      {isCountingDown && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-9xl font-bold">
          {countdownTime}
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center text-sm">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-blink" />
          Recording in Progress
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-2xl font-bold">
          Processing your answer...
        </div>
      )}
    </div>
  );
}
