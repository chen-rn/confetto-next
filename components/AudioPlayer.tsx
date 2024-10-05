"use client";

import { useRef, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
  }, []);

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} controls className="w-full max-w-md">
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
