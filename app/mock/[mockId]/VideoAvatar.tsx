"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useIsSpeaking, useParticipants, useVoiceAssistant } from "@livekit/components-react";
import { Loader2, CircleDashed, Sparkles, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { VIDEO_URLS } from "./constants";

interface VideoAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function VideoAvatar({ className, ...props }: VideoAvatarProps) {
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

    if (!hasPlayedInitial) {
      const playInitial = async () => {
        try {
          initialVideo.style.opacity = "1";
          talkingVideo.style.opacity = "0";
          idleVideo.style.opacity = "0";

          await initialVideo.play();
          initialVideo.onended = () => {
            initialVideo.style.opacity = "0";
            idleVideo.style.opacity = "1";
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

    const updateVideoStates = async () => {
      try {
        if (isSpeaking) {
          talkingVideo.style.opacity = "1";
          idleVideo.style.opacity = "0";
          await talkingVideo.play();
          idleVideo.pause();
        } else {
          talkingVideo.style.opacity = "0";
          idleVideo.style.opacity = "1";
          await idleVideo.play();
          talkingVideo.pause();
        }
      } catch (error) {
        console.error("Error updating video states:", error);
      }
    };

    updateVideoStates();
  }, [isSpeaking, isDisconnected, hasPlayedInitial, videosLoaded]);

  useEffect(() => {
    if (isSpeaking) {
      setHasSpokenOnce(false);
      setUserSilent(false);
    }
  }, [isSpeaking]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isUserSpeaking && !hasSpokenOnce) {
      setHasSpokenOnce(true);
    }
  }, [isUserSpeaking]);

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
    <div className={cn("relative w-full h-full bg-black", className)} {...props}>
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
          <div className="bg-[#635BFF] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-md">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-medium">Thinking...</span>
          </div>
        )}
      </div>
      <video
        ref={initialVideoRef}
        src={VIDEO_URLS.INITIAL}
        className="absolute inset-0 w-full h-full object-contain  opacity-0"
        onLoadedMetadata={(e) => {
          const video = e.target as HTMLVideoElement;
          video.playbackRate = 1.1;
        }}
        muted
        playsInline
      />

      <video
        ref={talkingVideoRef}
        src={VIDEO_URLS.TALKING}
        className="absolute inset-0 w-full h-full object-contain  opacity-0"
        muted
        playsInline
        loop
      />

      <video
        ref={idleVideoRef}
        src={VIDEO_URLS.IDLE}
        className="absolute inset-0 w-full h-full object-contain opacity-0"
        muted
        playsInline
        loop
      />
    </div>
  );
}
