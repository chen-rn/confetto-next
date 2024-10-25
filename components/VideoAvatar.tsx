"use client";

import React, { useRef, useEffect, useState } from "react";
import { useVoiceAssistant } from "@livekit/components-react";

export function VideoAvatar() {
  const talkingVideoRef = useRef<HTMLVideoElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get the voice assistant state
  const { state } = useVoiceAssistant();
  const isSpeaking = state === "speaking";
  // Fix the isDisconnected logic
  const isDisconnected =
    state === "disconnected" || state === "initializing" || state === "connecting";

  console.log("state", state);
  console.log("isDisconnected", isDisconnected);

  useEffect(() => {
    if (isDisconnected) return;

    const talkingVideo = talkingVideoRef.current;
    const idleVideo = idleVideoRef.current;

    if (!talkingVideo || !idleVideo) return;

    // Set idle video playback rate to 50%
    idleVideo.playbackRate = 0.5;

    // Set initial states and handle video switching
    if (isSpeaking) {
      const playTalking = async () => {
        try {
          setIsTransitioning(true);
          // Start playing the new video
          await talkingVideo.play();
          // Small delay to ensure the new video has started playing
          setTimeout(() => {
            idleVideo.pause();
            setIsTransitioning(false);
          }, 300);
        } catch (error) {
          console.error("Error playing talking video:", error);
          setIsTransitioning(false);
        }
      };
      playTalking();
    } else {
      const playIdle = async () => {
        try {
          setIsTransitioning(true);
          // Start playing the new video
          await idleVideo.play();
          // Small delay to ensure the new video has started playing
          setTimeout(() => {
            talkingVideo.pause();
            setIsTransitioning(false);
          }, 300);
        } catch (error) {
          console.error("Error playing idle video:", error);
          setIsTransitioning(false);
        }
      };
      playIdle();
    }
  }, [isSpeaking, isDisconnected]);

  if (isDisconnected) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-white/80 text-lg">AI Interviewer is not connected</p>
          <p className="text-white/60 text-sm">Please wait while the AI joins the room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full z-0">
      <video
        ref={talkingVideoRef}
        src="/videos/talking.mp4"
        muted
        playsInline
        loop
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
          isSpeaking ? "opacity-100" : "opacity-0"
        } ${isTransitioning ? "z-[1]" : "z-0"}`}
      />
      <video
        ref={idleVideoRef}
        src="/videos/idle.mp4"
        muted
        playsInline
        loop
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
          isSpeaking ? "opacity-0" : "opacity-100"
        } ${isTransitioning ? "z-0" : "z-[1]"}`}
      />
    </div>
  );
}
