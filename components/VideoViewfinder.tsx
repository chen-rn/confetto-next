"use client";

import React, { useEffect, useRef, useState } from "react";
import { Video } from "lucide-react";
import { useAtom } from "jotai";
import {
  isRecordingAtom,
  isProcessingAtom,
  isCountingDownAtom,
  countdownTimeAtom,
} from "@/lib/atoms/interviewAtoms";

export function VideoViewfinder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording] = useAtom(isRecordingAtom);
  const [isProcessing] = useAtom(isProcessingAtom);
  const [isCountingDown] = useAtom(isCountingDownAtom);
  const [countdownTime] = useAtom(countdownTimeAtom);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    async function setupVideoStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    }

    setupVideoStream();

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
      {videoStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <Video className="h-12 w-12 text-gray-400" />
        </div>
      )}

      <div className="absolute bottom-2 left-2 text-white text-sm font-medium bg-black bg-opacity-50 px-1 rounded">
        Me
      </div>

      {isRecording && (
        <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black bg-opacity-50 px-1 rounded">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-xs">Recording</span>
        </div>
      )}

      {isCountingDown && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white text-4xl font-bold">
          {countdownTime}
        </div>
      )}
    </div>
  );
}
