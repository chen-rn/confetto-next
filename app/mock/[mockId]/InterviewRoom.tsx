"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LiveKitRoom, RoomAudioRenderer, useDataChannel } from "@livekit/components-react";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { useRecording } from "@/hooks/useRecording";
import { useAtomValue, useAtom } from "jotai";
import { isRecordingAtom, isProcessingAtom, isUploadingAtom } from "@/lib/atoms/interview";
import { VideoViewfinder } from "@/app/mock/[mockId]/VideoViewfinder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoAvatar } from "@/app/mock/[mockId]/VideoAvatar";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Mic, Video } from "lucide-react";
import { EndInterviewModal } from "@/app/mock/[mockId]/components/EndInterviewModal";
import { DevicePermissionsCheck } from "./components/DevicePermissionsCheck";
import { atomWithStorage } from "jotai/utils";
import { devicePermissionsAtom } from "@/lib/atoms/permissions";
import { useRouter } from "next/navigation";

interface InterviewRoomProps {
  token: string;
  question: string;
  mockId: string;
  questionType?: string;
  tags: { id: string; name: string; type: string }[];
}

const PERMISSIONS_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

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
  const [permissionsState, setPermissionsState] = useAtom(devicePermissionsAtom);
  const router = useRouter();

  // Move endInterviewDirectly before the effects that use it
  const endInterviewDirectly = useCallback(async () => {
    if (isRecording && !isProcessing) {
      stopRecording();
    }
  }, [isRecording, isProcessing, stopRecording]);

  // All useEffects need to be here, before any conditional returns
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    async function checkInitialPermissions() {
      const now = Date.now();

      // Move the cache check outside the effect
      const currentState = permissionsState;
      if (
        currentState.hasPermissions !== null &&
        currentState.lastChecked &&
        now - currentState.lastChecked < PERMISSIONS_CACHE_DURATION
      ) {
        if (currentState.hasPermissions) {
          setTimeLeft(60);
        }
        return;
      }

      try {
        const permissions = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        permissions.getTracks().forEach((track) => track.stop());
        setPermissionsState({
          hasPermissions: true,
          lastChecked: now,
        });
        setTimeLeft(60);
      } catch (error) {
        setPermissionsState({
          hasPermissions: false,
          lastChecked: now,
        });
      }
    }

    checkInitialPermissions();
  }, []);

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

  const handleEnterEarly = () => {
    setShowQuestion(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Add phase calculation
  const currentPhase = timeLeft != null && timeLeft > 30 ? "Reading" : "Planning";
  const phaseTimeLeft = timeLeft != null ? (timeLeft > 30 ? timeLeft - 30 : timeLeft) : 0;
  const progress = timeLeft != null ? ((60 - timeLeft) / 60) * 100 : 0;

  // Conditional returns after all hooks
  if (!token) {
    return <div>Loading...</div>;
  }

  if (permissionsState.hasPermissions === null) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#635BFF] mb-4" />
          <p className="text-neutral-600 text-sm">Checking device permissions...</p>
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
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 py-4">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-center gap-4">
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
          </div>
        </header>

        {/* Main Content - Center Everything */}
        <div className="flex-1 container max-w-5xl mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center w-full max-w-2xl"
          >
            {/* Add the hint text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-neutral-400 mb-3"
            >
              You have 60 seconds to read and understand the question
            </motion.p>

            <Card className="w-full shadow-sm transition-all duration-200 hover:shadow-md relative overflow-hidden">
              {/* Progress bar as border */}
              <div
                className="absolute top-0 left-0 h-1 bg-[#635BFF] transition-all duration-200 ease-linear"
                style={{ width: `${progress}%` }}
              />

              <CardHeader className="bg-gradient-to-r from-[#635BFF]/5 to-transparent border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Question</CardTitle>
                <div className="text-lg font-semibold text-[#635BFF]">
                  {timeLeft === null ? "--" : `${timeLeft}s`}
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-neutral-700 leading-relaxed text-lg font-medium"
                >
                  {question}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8"
                >
                  <Button
                    onClick={handleEnterEarly}
                    className="w-full bg-[#635BFF] hover:bg-[#5a52f0] text-white transition-all duration-200 hover:shadow-lg"
                    size="lg"
                  >
                    Enter Interview Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            {/* System Status Card - More spacing */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 w-full mb-16" // Increased margin-top
            >
              <Card className="bg-white/50 border-dashed hover:bg-white/80 transition-colors duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      <span>System Ready</span>
                    </div>
                    <span className="text-neutral-400">Recording will start automatically</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
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
    <div className="h-screen flex flex-col bg-neutral-100">
      <LiveKitRoom
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="light"
        className="flex flex-col h-full"
      >
        <DataChannelHandler />
        {/* Header with interview info */}
        <div className="bg-white border-b border-neutral-200 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-neutral-900">{questionType} Interview</h1>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-600 hover:text-neutral-900"
                  onClick={() => {
                    /* Toggle mic */
                  }}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-600 hover:text-neutral-900"
                  onClick={() => {
                    /* Toggle camera */
                  }}
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 container mx-auto p-4 bg-transparent">
          <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Interviewer Video - Now with fixed aspect ratio */}
            <div className="flex-1 relative">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-neutral-900 shadow-lg">
                <VideoAvatar />
                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1.5 rounded-full">
                  <span className="text-white text-sm font-medium">Interviewer</span>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Now more compact on mobile */}
            <div className="lg:w-72 w-full flex flex-row lg:flex-col gap-4">
              {/* Your Video Preview - Smaller on mobile */}
              <VideoViewfinder />

              {/* Interview Info Card - Takes remaining width on mobile */}
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
                  {/* Question Section - Hide on very small screens */}
                  <div className="space-y-2 hidden sm:block">
                    <div className="font-medium text-sm text-neutral-600">Question</div>
                    <p className="text-sm text-neutral-900">{question}</p>
                  </div>

                  {/* Recording Status */}
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-neutral-700 font-medium">Recording in progress</span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 hidden sm:block">
                      Video and audio are being recorded
                    </div>
                  </div>

                  {/* End Interview Button */}
                  <Button
                    onClick={handleEndInterview}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    End Interview
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add the modal */}
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
