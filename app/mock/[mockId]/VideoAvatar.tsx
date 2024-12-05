"use client";

import React, { useRef, useEffect, useState } from "react";
import { useIsSpeaking, useParticipants, useVoiceAssistant } from "@livekit/components-react";
import { Loader2 } from "lucide-react";
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
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

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

      try {
        await Promise.all(
          videos.map((video) => {
            if (!video) return Promise.resolve();
            video.preload = "auto"; // Ensure preload is set
            return new Promise((resolve, reject) => {
              video.load();
              video.onloadeddata = resolve;
              video.onerror = reject;
              // Add timeout to prevent infinite loading
              setTimeout(reject, 10000);
            });
          })
        );

        setVideosLoaded(true);
        setLoadError(false);
      } catch (error) {
        console.error("Error loading videos:", error);
        setLoadError(true);
        // Retry logic
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            loadVideos();
          }, 1000 * (retryCount + 1)); // Exponential backoff
        }
      }
    };

    loadVideos();
  }, [retryCount]);

  const playVideoWithRetry = async (video: HTMLVideoElement, fallbackVideo?: HTMLVideoElement) => {
    let attempts = 0;
    while (attempts < MAX_RETRIES) {
      try {
        await video.play();
        return true;
      } catch (error) {
        console.error(`Error playing video (attempt ${attempts + 1}):`, error);
        attempts++;
        if (attempts === MAX_RETRIES && fallbackVideo) {
          // If main video fails, try fallback
          try {
            video.style.opacity = "0";
            fallbackVideo.style.opacity = "1";
            await fallbackVideo.play();
            return true;
          } catch (fallbackError) {
            console.error("Error playing fallback video:", fallbackError);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return false;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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

          const success = await playVideoWithRetry(initialVideo, idleVideo);
          if (success) {
            initialVideo.onended = () => {
              initialVideo.style.opacity = "0";
              idleVideo.style.opacity = "1";
              playVideoWithRetry(idleVideo);
              setHasPlayedInitial(true);
            };
          } else {
            // If initial video fails completely, skip to idle
            setHasPlayedInitial(true);
          }
        } catch (error) {
          console.error("Error in initial video sequence:", error);
          setHasPlayedInitial(true);
        }
      };
      playInitial();
      return;
    }

    const updateVideoStates = async () => {
      try {
        if (isSpeaking) {
          const success = await playVideoWithRetry(talkingVideo, idleVideo);
          if (success) {
            talkingVideo.style.opacity = "1";
            idleVideo.style.opacity = "0";
            idleVideo.pause();
          }
        } else {
          const success = await playVideoWithRetry(idleVideo, talkingVideo);
          if (success) {
            talkingVideo.style.opacity = "0";
            idleVideo.style.opacity = "1";
            talkingVideo.pause();
          }
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
