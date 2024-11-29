import { atom } from "jotai";

export interface TranscriptionEntry {
  speaker: "AI Interviewer" | "User";
  text: string;
  timestamp: number;
}

export const isRecordingAtom = atom(false);
export const isProcessingAtom = atom(false);
export const isCountingDownAtom = atom(false);
export const countdownTimeAtom = atom(3);
export const isUploadingAtom = atom(false);

// Store the structured transcription data
export const transcriptionEntriesAtom = atom<TranscriptionEntry[]>([]);

// Derived atom for formatted transcription string
export const formattedTranscriptionAtom = atom((get) => {
  const entries = get(transcriptionEntriesAtom);
  return entries
    .map(({ speaker, text }) => `${speaker}: ${text}`)
    .join("\n");
});
