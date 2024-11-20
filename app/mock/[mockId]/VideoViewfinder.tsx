"use client";

import React, { useEffect, useRef, useState } from "react";
import { Video } from "lucide-react";
import { useAtom } from "jotai";
import {
  isRecordingAtom,
  isProcessingAtom,
  isCountingDownAtom,
  countdownTimeAtom,
} from "@/lib/atoms/interview";
import { useIsSpeaking, useParticipants } from "@livekit/components-react";

export function VideoViewfinder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording] = useAtom(isRecordingAtom);
  const [isProcessing] = useAtom(isProcessingAtom);
  const [isCountingDown] = useAtom(isCountingDownAtom);
  const [countdownTime] = useAtom(countdownTimeAtom);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const participants = useParticipants();
  const localParticipant = participants.find((p) => p.isLocal);
  const isUserSpeaking = useIsSpeaking(localParticipant);

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

    const timer = setTimeout(() => {
      setupVideoStream();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoRef.current]); // Added videoRef.current to dependencies

  return (
    <div
      className={`relative rounded-xl overflow-hidden border-2 w-full bg-neutral-900 shadow-md aspect-video min-h-[240px] ${
        isUserSpeaking ? "border-green-500" : "border-transparent"
      }`}
    >
      {videoStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full transform scale-x-[-1] object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
          <Video className="h-12 w-12 text-neutral-400" />
        </div>
      )}

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
