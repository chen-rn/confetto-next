"use client";

import { useEffect, useState } from "react";
import { useMaybeRoomContext } from "@livekit/components-react";
import { RoomEvent, type TranscriptionSegment } from "livekit-client";
import { useAtom } from "jotai";
import { transcriptionAtom } from "@/lib/atoms/interview";

export function TranscriptionHandler() {
  const room = useMaybeRoomContext();
  const [, setTranscriptionStore] = useAtom(transcriptionAtom);
  const [transcriptions, setTranscriptions] = useState<{ [id: string]: TranscriptionSegment }>({});

  useEffect(() => {
    if (!room) return;

    const updateTranscriptions = (segments: TranscriptionSegment[]) => {
      setTranscriptions((prev) => {
        const newTranscriptions = { ...prev };
        for (const segment of segments) {
          newTranscriptions[segment.id] = segment;
        }
        return newTranscriptions;
      });

      // Update the global transcription store
      const fullTranscript = Object.values(transcriptions)
        .sort((a, b) => a.firstReceivedTime - b.firstReceivedTime)
        .map((segment) => segment.text)
        .join(" ");

      setTranscriptionStore(fullTranscript);
    };

    room.on(RoomEvent.TranscriptionReceived, updateTranscriptions);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateTranscriptions);
    };
  }, [room, setTranscriptionStore, transcriptions]);

  return null;
}
