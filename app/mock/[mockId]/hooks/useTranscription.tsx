"use client";

import { useState, useEffect } from "react";
import { RoomEvent, TranscriptionSegment, Participant, TrackPublication } from "livekit-client";
import { useMaybeRoomContext } from "@livekit/components-react";
import { useAtom } from "jotai";
import { transcriptionEntriesAtom, type TranscriptionEntry } from "@/lib/atoms/interview";

interface Transcription {
  segment: TranscriptionSegment;
  participant?: Participant;
  publication?: TrackPublication;
}

export function useTranscription() {
  const room = useMaybeRoomContext();
  const [entries, setEntries] = useAtom(transcriptionEntriesAtom);
  const [rawSegments, setRawSegments] = useState<{
    [id: string]: Transcription;
  }>({});

  // Step 1: Collect raw segments
  useEffect(() => {
    if (!room) return;

    const updateRawSegments = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      publication?: TrackPublication
    ) => {
      setRawSegments((prev) => {
        const newSegments = { ...prev };
        for (const segment of segments) {
          newSegments[segment.id] = { segment, participant, publication };
        }
        return newSegments;
      });
    };

    room.on(RoomEvent.TranscriptionReceived, updateRawSegments);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, updateRawSegments);
    };
  }, [room]);

  // Step 2: Process and merge segments into entries
  useEffect(() => {
    // Sort segments by time
    const sorted = Object.values(rawSegments).sort(
      (a, b) => (a.segment.firstReceivedTime ?? 0) - (b.segment.firstReceivedTime ?? 0)
    );

    // Merge adjacent segments from the same speaker
    const mergedSegments = sorted.reduce((acc, current) => {
      if (acc.length === 0) {
        return [current];
      }

      const last = acc[acc.length - 1];
      const isFromSameSpeaker = last.participant === current.participant;
      const timeGap =
        (current.segment.firstReceivedTime ?? 0) - (last.segment.lastReceivedTime ?? 0);
      const areStatusMessages =
        last.segment.id.startsWith("status-") || current.segment.id.startsWith("status-");

      if (
        isFromSameSpeaker &&
        timeGap <= 1000 && // 1 second threshold
        !areStatusMessages
      ) {
        // Merge with previous segment
        return [
          ...acc.slice(0, -1),
          {
            ...current,
            segment: {
              ...current.segment,
              text: `${last.segment.text} ${current.segment.text}`,
              id: current.segment.id,
              firstReceivedTime: last.segment.firstReceivedTime,
            },
          },
        ];
      }

      // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
      return [...acc, current];
    }, [] as Transcription[]);

    // Convert merged segments to entries

    setEntries(
      mergedSegments
        .filter(({ segment }) => segment.text.trim() !== "")
        .map(({ segment, participant }) => ({
          speaker: participant?.isAgent ? "AI Interviewer" : "User",
          text: segment.text.trim(),
          timestamp: segment.firstReceivedTime ?? Date.now(),
        }))
    );
  }, [rawSegments, setEntries]);

  return {
    entries,
  };
}
