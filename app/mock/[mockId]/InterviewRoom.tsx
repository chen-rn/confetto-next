"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { useRecording } from "@/hooks/useRecording";
import { useAtom, useAtomValue } from "jotai";
import { isRecordingAtom, isProcessingAtom } from "@/lib/atoms/interview";
import { VideoViewfinder } from "@/app/mock/[mockId]/VideoViewfinder";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { VideoAvatar } from "@/app/mock/[mockId]/VideoAvatar";
import { useRouter } from "next/navigation";

interface InterviewRoomProps {
  token: string;
  question: string;
  mockId: string;
}

export function InterviewRoom({ token, question, mockId }: InterviewRoomProps) {
  const [showQuestion, setShowQuestion] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(8 * 60); // 8 minutes in seconds
  const isRecording = useAtomValue(isRecordingAtom);
  const isProcessing = useAtomValue(isProcessingAtom);
  const { startRecording, stopRecording } = useRecording(mockId);

  const handleEndInterview = useCallback(async () => {
    if (isRecording && !isProcessing) {
      await stopRecording();
    }
  }, [isRecording, isProcessing, stopRecording]);

  useEffect(() => {
    if (timeLeft > 0 && showQuestion) {
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
            handleEndInterview();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showQuestion, handleEndInterview]);

  useEffect(() => {
    if (!showQuestion && !isRecording && !isProcessing) {
      const startInterviewRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        startRecording(stream);
      };
      startInterviewRecording();
    }
  }, [showQuestion, isRecording, isProcessing, startRecording]);

  const handleEnterEarly = () => {
    setShowQuestion(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  if (!token) {
    return <div>Loading...</div>;
  }

  if (showQuestion) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 flex-col gap-4">
        <div className="text-xl font-semibold text-primary">Time remaining: {timeLeft} seconds</div>
        <Card className="w-full max-w-2xl shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-2xl">
            <CardTitle className="text-2xl font-semibold text-center">Question</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-700 leading-relaxed mb-4">{question}</p>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-4 bg-gray-50 p-6 rounded-b-2xl">
            <Button onClick={handleEnterEarly} className="w-full max-w-xs rounded-full">
              Enter Interview Room Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <LiveKitRoom
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        className="w-full h-full"
      >
        <VideoAvatar />
        <RoomAudioRenderer />
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-3.5 py-1.5 rounded-full shadow-md z-10">
          <p className="text-md font-semibold text-black">
            Time remaining: {formatTime(interviewTimeLeft)}
          </p>
        </div>
        <div className="absolute right-4 bottom-4 z-10">
          <Button
            onClick={handleEndInterview}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold tracking-wide"
          >
            {isProcessing ? "Processing..." : "End Interview Early"}
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <VideoViewfinder />
        </div>
      </LiveKitRoom>
    </div>
  );
}
