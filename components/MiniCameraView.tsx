"use client";

import React, { useState, useRef } from "react";
import { formatTime } from "@/utils/formatTime";
import { Video } from "lucide-react";
import { useAtom } from "jotai";
import {
  isRecordingAtom,
  isProcessingAtom,
  isCountingDownAtom,
  countdownTimeAtom,
} from "@/lib/atoms/interviewAtoms";

export function MiniCameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording] = useAtom(isRecordingAtom);
  const [isProcessing] = useAtom(isProcessingAtom);
  const [isCountingDown] = useAtom(isCountingDownAtom);
  const [countdownTime] = useAtom(countdownTimeAtom);

  return (
    <div className="relative w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]"
      />

      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <Video className="h-12 w-12 text-gray-400" />
      </div>

      <div className="absolute bottom-2 left-2 text-white text-sm font-medium">Me</div>

      {isRecording && (
        <div className="absolute top-2 left-2 flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}

      {isCountingDown && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white text-4xl font-bold">
          {countdownTime}
        </div>
      )}

      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-75 text-white text-xs text-center p-2">
          Processing...
        </div>
      )}
    </div>
  );
}
