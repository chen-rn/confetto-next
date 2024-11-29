"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LiveKitRoom, RoomAudioRenderer, useDataChannel } from "@livekit/components-react";
import "@livekit/components-styles";
import { useRecording } from "@/hooks/useRecording";
import { useAtomValue } from "jotai";
import { isRecordingAtom, isProcessingAtom, isUploadingAtom } from "@/lib/atoms/interview";
import { VideoViewfinder } from "@/app/mock/[mockId]/VideoViewfinder";
import { VideoAvatar } from "@/app/mock/[mockId]/VideoAvatar";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import "react-circular-progressbar/dist/styles.css";
import { EndInterviewModal } from "@/app/mock/[mockId]/components/EndInterviewModal";
import { DevicePermissionsCheck } from "./components/DevicePermissionsCheck";
import { QuestionPreview } from "./components/QuestionPreview";
import { InterviewHeader } from "./components/InterviewHeader";
import { useDevicePermissions } from "@/hooks/useDevicePermissions";
import { TranscriptionHandler } from "./components/TranscriptionHandler";
import { TranscriptionDisplay } from "./components/TranscriptionDisplay";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface InterviewRoomProps {
  token: string;
  question: string;
  mockId: string;
  questionType?: string;
  tags: { id: string; name: string; type: string }[];
}

export function InterviewRoom({
  token,
  question,
  mockId,
  questionType = "Ethics",
  tags,
}: InterviewRoomProps) {
  const [showQuestion, setShowQuestion] = useState(true);
  const [timeLeftToReadQuestion, setTimeLeftToReadQuestion] = useState<number>(60);
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(8 * 60);
  const isRecording = useAtomValue(isRecordingAtom);
  const isProcessing = useAtomValue(isProcessingAtom);
  const isUploading = useAtomValue(isUploadingAtom);
  const { startRecording, stopRecording } = useRecording(mockId);
  const [showEndModal, setShowEndModal] = useState(false);
  const { permissionsState, setPermissionsState } = useDevicePermissions();
  const [state, setState] = useState("idle");

  // Move timer logic to useEffect
  useEffect(() => {
    if (permissionsState.hasPermissions) {
      setTimeLeftToReadQuestion(60);
    }
  }, [permissionsState.hasPermissions]);

  // Move endInterviewDirectly before the effects that use it
  const endInterviewDirectly = useCallback(async () => {
    if (isRecording && !isProcessing) {
      stopRecording();
    }
  }, [isRecording, isProcessing, stopRecording]);

  useEffect(() => {
    if (timeLeftToReadQuestion !== null && timeLeftToReadQuestion > 0 && showQuestion) {
      const timer = setTimeout(() => setTimeLeftToReadQuestion(timeLeftToReadQuestion - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeftToReadQuestion === 0) {
      setShowQuestion(false);
    }
  }, [timeLeftToReadQuestion, showQuestion]);

  useEffect(() => {
    if (!showQuestion) {
      const timer = setInterval(() => {
        setInterviewTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            endInterviewDirectly();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showQuestion, endInterviewDirectly]);

  useEffect(() => {
    if (!showQuestion && !isRecording && !isProcessing) {
      startRecording();
    }
  }, [showQuestion, isRecording, isProcessing, startRecording]);

  const handleEndInterview = useCallback(async () => {
    setShowEndModal(true);
  }, []);

  const handleSubmitInterview = useCallback(async () => {
    if (isRecording && !isProcessing) {
      await stopRecording();
    }
  }, [isRecording, isProcessing, stopRecording]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Conditional returns after all hooks
  if (!token || permissionsState.hasPermissions === null) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#635BFF] mb-4" />
          <p className="text-neutral-600 text-sm">
            {!token ? "Loading..." : "Checking device permissions..."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (permissionsState.hasPermissions === false) {
    return (
      <DevicePermissionsCheck
        onPermissionsGranted={() => {
          setPermissionsState({
            hasPermissions: true,
            lastChecked: Date.now(),
          });
          setTimeLeftToReadQuestion(60);
        }}
      />
    );
  }

  if (showQuestion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-neutral-100"
      >
        <InterviewHeader questionType={questionType} tags={tags} showQuestion={true} />
        <div className="flex-1 container max-w-5xl mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <QuestionPreview
            question={question}
            timeLeft={timeLeftToReadQuestion}
            progress={
              timeLeftToReadQuestion != null ? ((60 - timeLeftToReadQuestion) / 60) * 100 : 0
            }
            onEnterEarly={() => setShowQuestion(false)}
            tags={tags}
          />
        </div>
      </motion.div>
    );
  }

  if (isUploading) {
    return (
      <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-xl"
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#635BFF] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">Processing Your Interview</h3>
          <p className="text-neutral-600">
            Please keep this tab open while we upload and process your interview recording.
          </p>
        </motion.div>
      </div>
    );
  }

  function DataChannelHandler() {
    useDataChannel((message) => {
      try {
        const textDecoder = new TextDecoder();
        const messageString = textDecoder.decode(message.payload);
        const data = JSON.parse(messageString);

        if (data.type === "INTERVIEW_END") {
          endInterviewDirectly();
        }
      } catch (error) {
        console.error("Failed to parse data channel message:", error);
      }
    });

    return null;
  }

  return (
    <div className="h-screen flex bg-neutral-100">
      <LiveKitRoom
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="light"
        className="flex w-full"
      >
        <DataChannelHandler />
        <TranscriptionHandler />

        {/* Main content grid */}
        <div className="flex w-full gap-2 sm:gap-4 p-2 sm:p-4">
          {/* Left section - Interviewer video and user video overlay */}
          <div className="w-[65%] lg:w-[70%]">
            <div className="relative w-full h-full rounded-xl bg-white shadow-sm overflow-hidden">
              {/* Interviewer video container */}
              <div className="absolute inset-0">
                <VideoAvatar className="w-full h-full object-cover" />
              </div>

              {/* User video overlay */}
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 w-[200px] sm:w-[260px] lg:w-[320px]">
                <VideoViewfinder className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Right section - Info panel and transcription */}
          <div className="w-[35%] lg:w-[30%] flex flex-col gap-2 sm:gap-4">
            {/* Question and Timer Card */}
            <div className="rounded-xl bg-white shadow-sm shrink-0">
              {/* Header */}
              <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#635BFF]" />
                  <h1 className="text-sm sm:text-base font-medium text-neutral-900">Ethics Interview</h1>
                </div>
              </div>

              {/* Timer and Progress */}
              <div className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="text-xl sm:text-2xl font-semibold text-[#635BFF] mb-1">
                  {formatTime(interviewTimeLeft)}
                </div>
                <div className="text-xs sm:text-sm text-neutral-500 mb-2">Time Remaining</div>
                <div className="h-1.5 sm:h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#635BFF] transition-all duration-1000"
                    style={{ 
                      width: `${((480 - interviewTimeLeft) / 480) * 100}%`,
                      backgroundColor: interviewTimeLeft < 60 ? '#ef4444' : '#635BFF'
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="px-3 sm:px-4 py-2 sm:py-3">
                <h2 className="text-xs sm:text-sm font-medium text-neutral-500 mb-2">Current Question</h2>
                <div className="p-2 sm:p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-neutral-900 leading-relaxed">{question}</p>
                </div>
              </div>
            </div>

            {/* Transcription Card */}
            <div className="rounded-xl bg-white shadow-sm flex-1 min-h-0">
              <TranscriptionDisplay />
            </div>

            {/* Recording controls */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Recording in progress</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-4"
                onClick={handleEndInterview}
                disabled={isProcessing}
              >
                End Interview
              </Button>
            </div>
          </div>
        </div>

        <EndInterviewModal
          isOpen={showEndModal}
          onOpenChange={setShowEndModal}
          onSubmit={handleSubmitInterview}
          isProcessing={isProcessing}
        />

        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
