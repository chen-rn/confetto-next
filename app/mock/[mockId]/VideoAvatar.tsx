"use client";

import React, { useRef, useEffect, useState } from "react";
import { useVoiceAssistant } from "@livekit/components-react";

export function VideoAvatar() {
  const talkingVideoRef = useRef<HTMLVideoElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const initialVideoRef = useRef<HTMLVideoElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasPlayedInitial, setHasPlayedInitial] = useState(false);
  const [videosLoaded, setVideosLoaded] = useState(false);

  const { state } = useVoiceAssistant();
  const isSpeaking = state === "speaking";
  const isDisconnected =
    state === "disconnected" || state === "initializing" || state === "connecting";

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

    // Handle initial video playback
    if (!hasPlayedInitial) {
      const playInitial = async () => {
        try {
          idleVideo.style.opacity = "0";
          await initialVideo.play();
          initialVideo.onended = () => {
            initialVideo.style.opacity = "0";
            idleVideo.style.opacity = "1";
            idleVideo.play();
            setTimeout(() => {
              setHasPlayedInitial(true);
              initialVideo.style.display = "none";
            }, 300);
          };
        } catch (error) {
          console.error("Error playing initial video:", error);
          setHasPlayedInitial(true);
        }
      };
      playInitial();
      return;
    }

    // Regular talking/idle logic
    if (isSpeaking) {
      const playTalking = async () => {
        try {
          await talkingVideo.play();
          talkingVideo.style.opacity = "1";
          idleVideo.style.opacity = "0";
          setTimeout(() => idleVideo.pause(), 300);
        } catch (error) {
          console.error("Error playing talking video:", error);
        }
      };
      playTalking();
    } else {
      const playIdle = async () => {
        try {
          await idleVideo.play();
          idleVideo.style.opacity = "1";
          talkingVideo.style.opacity = "0";
          setTimeout(() => talkingVideo.pause(), 300);
        } catch (error) {
          console.error("Error playing idle video:", error);
        }
      };
      playIdle();
    }
  }, [isSpeaking, isDisconnected, hasPlayedInitial, videosLoaded]);

  return (
    <div className="relative w-full h-full bg-black z-0">
      <video
        ref={initialVideoRef}
        src="/videos/initial.mp4"
        muted
        playsInline
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
          hasPlayedInitial ? "hidden" : ""
        }`}
      />
      <video
        ref={talkingVideoRef}
        src="/videos/talking.mp4"
        muted
        playsInline
        loop
        className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
      <video
        ref={idleVideoRef}
        src="/videos/idle.mp4"
        muted
        playsInline
        loop
        className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
