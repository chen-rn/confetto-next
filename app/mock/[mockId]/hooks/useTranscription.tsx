"use client";

import { useEffect } from "react";
import { RoomEvent, TranscriptionSegment, Participant } from "livekit-client";
import { useMaybeRoomContext } from "@livekit/components-react";
import { useAtom } from "jotai";
import { transcriptionEntriesAtom, type TranscriptionEntry } from "@/lib/atoms/interview";

const MERGE_THRESHOLD_MS = 1000; // Merge segments within 1 second

export function useTranscription() {
  const room = useMaybeRoomContext();
  const [entries, setEntries] = useAtom(transcriptionEntriesAtom);

  useEffect(() => {
    if (!room) return;

    const handleTranscription = (
      segments: TranscriptionSegment[],
      participant?: Participant
    ) => {
      setEntries((prevEntries) => {
        const newEntries = [...prevEntries];
        
        segments.forEach((segment) => {
          const speaker = participant?.isAgent ? "AI Interviewer" : "User";
          const timestamp = segment.firstReceivedTime ?? Date.now();
          
          // Try to merge with the last entry if it's from the same speaker and within threshold
          const lastEntry = newEntries[newEntries.length - 1];
          if (
            lastEntry &&
            lastEntry.speaker === speaker &&
            timestamp - lastEntry.timestamp <= MERGE_THRESHOLD_MS
          ) {
            lastEntry.text += " " + segment.text;
            return;
          }
          
          // Otherwise, add as new entry
          newEntries.push({
            speaker,
            text: segment.text,
            timestamp,
          });
        });
        
        return newEntries.sort((a, b) => a.timestamp - b.timestamp);
      });
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room, setEntries]);

  return {
    entries,
  };
}
