"use client";

import React, { useState } from "react";
import { useMediaSetup } from "@/hooks/useMediaSetup";
import { useRecording } from "@/hooks/useRecording";
import { formatTime } from "@/utils/formatTime";
import { useToast } from "@/hooks/use-toast";
import { Video } from "lucide-react";

interface MiniCameraViewProps {
  mockId: string;
  maxRecordingTime?: number;
}

export function MiniCameraView({ mockId, maxRecordingTime = 300 }: MiniCameraViewProps) {
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
  const [isCameraOn, setIsCameraOn] = useState(true);

  const handleToggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    if (videoRef.current) {
      const tracks = videoRef.current.srcObject as MediaStream;
      tracks?.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn;
      });
    }
  };

  const handleStartRecording = async () => {
    try {
      if (!isRecording && videoRef.current?.srcObject) {
        await startRecording(videoRef.current.srcObject as MediaStream);
      } else {
        throw new Error("Unable to start recording");
      }
    } catch (error) {
      console.error("Recording start error:", error);
      toast({
        title: "Recording start error",
        description: (error as Error).message || "There was an issue starting the recording.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
      toast({
        title: "Recording stopped",
        description: "Your recording is being processed.",
      });
    } catch (error) {
      console.error("Recording stop error:", error);
      toast({
        title: "Recording stop error",
        description: (error as Error).message || "There was an issue stopping the recording.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform scale-x-[-1] ${
          isCameraOn ? "" : "hidden"
        }`}
      />

      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <Video className="h-12 w-12 text-gray-400" />
        </div>
      )}

      <div className="absolute bottom-2 left-2 text-white text-sm font-medium">Me</div>

      {isRecording && (
        <div className="absolute top-2 left-2 flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-xs">{formatTime(remainingTime)}</span>
        </div>
      )}

      {isCountingDown && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white text-4xl font-bold">
          {countdownTime}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-75 text-white text-xs text-center p-2">
          {error}
        </div>
      )}
    </div>
  );
}
