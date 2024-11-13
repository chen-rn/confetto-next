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
import { InterviewControls } from "./components/InterviewControls";
import { TranscriptionHandler } from "./components/TranscriptionHandler";

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
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(8 * 60);
  const isRecording = useAtomValue(isRecordingAtom);
  const isProcessing = useAtomValue(isProcessingAtom);
  const isUploading = useAtomValue(isUploadingAtom);
  const { startRecording, stopRecording } = useRecording(mockId);
  const [showEndModal, setShowEndModal] = useState(false);
  const { permissionsState, checkPermissions, setPermissionsState } = useDevicePermissions();

  // Add this useEffect at the top of the component with other effects
  useEffect(() => {
    // Trigger permission check on component mount
    if (permissionsState.hasPermissions === null) {
      checkPermissions();
    }
  }, [checkPermissions, permissionsState.hasPermissions]);

  // Move timer logic to useEffect
  useEffect(() => {
    if (permissionsState.hasPermissions) {
      setTimeLeft(60);
    }
  }, [permissionsState.hasPermissions]);

  // Move endInterviewDirectly before the effects that use it
  const endInterviewDirectly = useCallback(async () => {
    if (isRecording && !isProcessing) {
      stopRecording();
    }
  }, [isRecording, isProcessing, stopRecording]);

  // All useEffects need to be here, before any conditional returns
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && showQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0) {
      setShowQuestion(false);
    }
  }, [timeLeft, showQuestion]);

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
      const startInterviewRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        startRecording(stream);
      };
      startInterviewRecording();
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
          setTimeLeft(60);
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
            timeLeft={timeLeft}
            progress={timeLeft != null ? ((60 - timeLeft) / 60) * 100 : 0}
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
    <div className="h-screen flex flex-col bg-neutral-100 ">
      <LiveKitRoom
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="light"
        className="flex flex-col h-full"
      >
        <DataChannelHandler />
        <TranscriptionHandler />
        <InterviewHeader questionType={questionType} tags={tags} />

        <div className="flex-1 container mx-auto p-4 bg-transparent">
          <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="flex-1 relative">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-neutral-900 shadow-lg">
                <VideoAvatar />
                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1.5 rounded-full">
                  <span className="text-white text-sm font-medium">Interviewer</span>
                </div>
              </div>
            </div>

            <div className="lg:w-80 w-full flex flex-col lg:flex-col gap-4 min-h-0">
              <VideoViewfinder />
              <InterviewControls
                interviewTimeLeft={interviewTimeLeft}
                question={question}
                onEndInterview={handleEndInterview}
                isProcessing={isProcessing}
                formatTime={formatTime}
              />
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
