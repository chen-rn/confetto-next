// components/MicButton.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { uploadAudioToFirebase } from "@/lib/firebase";
import { saveAudioUrl } from "@/lib/actions";

interface MicButtonProps {
  sessionId: string;
}

export default function MicButton({ sessionId }: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Microphone access is required to record audio.");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      return new Promise<void>((resolve) => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        mediaRecorderRef.current!.onstop = async () => {
          if (chunksRef.current.length > 0) {
            const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
            try {
              const url = await uploadAudioToFirebase(audioBlob, sessionId);
              console.log("Audio uploaded successfully:", url);
              await saveAudioUrl(url, sessionId);
            } catch (error) {
              console.error("Error uploading audio:", error);
            }
          } else {
            console.log("No audio data recorded");
          }
          resolve();
        };

        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      });
    }
  }, [isRecording, sessionId]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={toggleRecording}
        variant={isRecording ? "destructive" : "default"}
        size="icon"
        className="w-16 h-16 rounded-full"
      >
        {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
      </Button>
      {isRecording && <span className="mt-2 text-sm font-medium">{formatTime(timer)}</span>}
    </div>
  );
}
