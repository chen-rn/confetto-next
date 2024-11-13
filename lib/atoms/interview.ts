import { atom } from "jotai";

export const isRecordingAtom = atom(false);
export const isProcessingAtom = atom(false);
export const isCountingDownAtom = atom(false);
export const countdownTimeAtom = atom(3);
export const isUploadingAtom = atom(false);
export const transcriptionAtom = atom<string>("");
