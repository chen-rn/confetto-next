"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useIsSpeaking, useParticipants, useVoiceAssistant } from "@livekit/components-react";
import { Loader2, CircleDashed, Sparkles, Hourglass } from "lucide-react";

export function VideoAvatar() {
  const talkingVideoRef = useRef<HTMLVideoElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const initialVideoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayedInitial, setHasPlayedInitial] = useState(false);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [userSilent, setUserSilent] = useState(false);
  const [hasSpokenOnce, setHasSpokenOnce] = useState(false);

  const { state } = useVoiceAssistant();
  const isSpeaking = state === "speaking";
  const isDisconnected =
    state === "disconnected" || state === "initializing" || state === "connecting";

  const participants = useParticipants();
  const localParticipant = participants.find((p) => p.isLocal);
  const isUserSpeaking = useIsSpeaking(localParticipant);
  // Preload videos
  useEffect(() => {
    const loadVideos = async () => {
      const videos = [initialVideoRef.current, talkingVideoRef.current, idleVideoRef.current];

      if (!videos.every(Boolean)) return;

      await Promise.all(
        videos.map((video) => {
          if (!video) return Promise.resolve();
          return new Promise((resolve) => {
            video.load();
            video.onloadeddata = resolve;
          });
        })
      );

      setVideosLoaded(true);
    };

    loadVideos();
  }, []);

  useEffect(() => {
    if (isDisconnected || !videosLoaded) return;

    const initialVideo = initialVideoRef.current;
    const talkingVideo = talkingVideoRef.current;
    const idleVideo = idleVideoRef.current;

    if (!talkingVideo || !idleVideo || !initialVideo) return;

    // Handle initial video sequence
    if (!hasPlayedInitial) {
      initialVideo.style.display = "block";
      talkingVideo.style.display = "none";
      idleVideo.style.display = "none";

      const playInitial = async () => {
        try {
          await initialVideo.play();
          initialVideo.onended = () => {
            initialVideo.style.display = "none";
            idleVideo.style.display = "block";
            idleVideo.play();
            setHasPlayedInitial(true);
          };
        } catch (error) {
          console.error("Error playing initial video:", error);
          setHasPlayedInitial(true);
        }
      };
      playInitial();
      return;
    }

    // Handle talking/idle states
    if (isSpeaking) {
      idleVideo.style.display = "none";
      talkingVideo.style.display = "block";
      talkingVideo.play();
    } else {
      talkingVideo.style.display = "none";
      idleVideo.style.display = "block";
      if (idleVideo.paused) {
        idleVideo.play();
      }
    }
  }, [isSpeaking, isDisconnected, hasPlayedInitial, videosLoaded]);

  // Reset both flags when AI speaks
  useEffect(() => {
    if (isSpeaking) {
      setHasSpokenOnce(false);
      setUserSilent(false);
    }
  }, [isSpeaking]);

  // Track if user has spoken at least once
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isUserSpeaking && !hasSpokenOnce) {
      setHasSpokenOnce(true);
    }
  }, [isUserSpeaking]);

  // Modify silence detection to check hasSpokenOnce
  useEffect(() => {
    if (!isUserSpeaking && hasSpokenOnce) {
      const timer = setTimeout(() => {
        setUserSilent(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setUserSilent(false);
    }
  }, [isUserSpeaking, hasSpokenOnce]);

  return (
    <div className="relative w-full h-full bg-black z-0">
      {isDisconnected && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-white">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Initializing interview...</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
          <span className="text-white text-sm font-medium">Interviewer</span>
        </div>
        {userSilent && hasSpokenOnce && !isSpeaking && !isDisconnected && (
          <div className="bg-black/30 backdrop-blur-sm rounded-full p-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white animate-spin" />
            <span className="text-white text-sm">Generating response...</span>
          </div>
        )}
      </div>
      <video
        ref={initialVideoRef}
        src="/videos/initial.mp4"
        muted
        playsInline
        className={`w-full h-full object-contain absolute inset-0`}
      />
      <video
        ref={talkingVideoRef}
        src="/videos/talking.mp4"
        muted
        playsInline
        loop
        className="w-full h-full object-contain absolute inset-0"
        style={{ display: "none" }}
      />
      <video
        ref={idleVideoRef}
        src="/videos/idle.mp4"
        muted
        playsInline
        loop
        className="w-full h-full object-contain absolute inset-0"
        style={{ display: "none" }}
      />
    </div>
  );
}
