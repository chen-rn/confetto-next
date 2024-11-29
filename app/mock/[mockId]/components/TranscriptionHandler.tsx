"use client";

import { useTranscription } from "../hooks/useTranscription";

// This component now just initializes the transcription hook
export function TranscriptionHandler() {
  useTranscription();
  return null;
}
