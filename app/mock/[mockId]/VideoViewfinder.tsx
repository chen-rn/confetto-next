"use client";

import React, { useEffect, useRef, useState } from "react";
import { Video } from "lucide-react";
import { useIsSpeaking, useParticipants } from "@livekit/components-react";
import { cn } from "@/lib/utils";

interface VideoViewfinderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function VideoViewfinder({ className, ...props }: VideoViewfinderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
      className={cn(
        "relative rounded-xl overflow-hidden border-2 w-full bg-neutral-900 shadow-md aspect-video",
        isUserSpeaking ? "border-green-500" : "border-transparent",
        className
      )}
      {...props}
    >
      {!videoStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Video className="w-6 h-6 text-white/50" />
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
      {isUserSpeaking && (
        <div className="absolute bottom-2 left-2 w-2 h-2">
          <div className="absolute w-full h-full bg-green-400 rounded-full animate-ping" />
          <div className="absolute w-full h-full bg-green-400 rounded-full" />
        </div>
      )}
    </div>
  );
}
