import { useState, useRef, useCallback, useEffect } from "react";
import { getSupportedMimeType } from "@/utils/mediaUtils";
import { uploadVideo, uploadAudioToFirebase } from "@/lib/apis/firebase";
import { updateMockInterviewMedia } from "@/app/actions/updateMockInterviewMedia";
import { processAudioSubmission } from "@/lib/actions/processAudioSubmission";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export function useRecording(mockId: string, maxRecordingTime: number) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [remainingTime, setRemainingTime] = useState(maxRecordingTime);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownTime, setCountdownTime] = useState(3);
  const router = useRouter();

  const streamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCountdown = useCallback(() => {
    console.log("Starting countdown");
    setIsCountingDown(true);
    setCountdownTime(3);
    const countdownInterval = setInterval(() => {
      setCountdownTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, []);

  const initializeRecording = useCallback((stream: MediaStream) => {
    console.log("Initializing recording");
    streamRef.current = stream;

    if (!window.MediaRecorder) {
      throw new Error("MediaRecorder is not supported in this browser.");
    }

    const mimeType = getSupportedMimeType(
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4"
    );

    if (!mimeType) {
      throw new Error("No supported MIME types for recording.");
    }

    try {
      recorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 500000,
        audioBitsPerSecond: 64000,
      });

      recorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      console.log("MediaRecorder initialized");
    } catch (error) {
      console.error("Error initializing MediaRecorder:", error);
      throw error;
    }
  }, []);

  const startRecording = useCallback(
    (stream: MediaStream) => {
      console.log("startRecording called");
      startCountdown();
      initializeRecording(stream);

      setTimeout(() => {
        console.log("Countdown finished, starting actual recording");
        try {
          if (!recorderRef.current) {
            throw new Error("MediaRecorder not initialized");
          }

          recorderRef.current.start(1000);
          console.log("MediaRecorder started");

          setIsRecording(true);
          setRemainingTime(maxRecordingTime);

          timerRef.current = setInterval(() => {
            setRemainingTime((prevTime) => {
              if (prevTime <= 1) {
                stopRecording();
                return 0;
              }
              return prevTime - 1;
            });
          }, 1000);
        } catch (error) {
          console.error("Error starting recording:", error);
          throw error;
        }
      }, 3000);
    },
    [maxRecordingTime, startCountdown, initializeRecording]
  );

  const stopRecording = useCallback(async () => {
    if (isRecording) {
      setIsProcessing(true);
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }

      await new Promise<void>((resolve) => {
        if (recorderRef.current) {
          recorderRef.current.onstop = () => resolve();
        }
      });

      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      chunksRef.current = [];

      try {
        // Convert Blob to File for video upload
        const file = new File([blob], `video_${mockId}_${Date.now()}.webm`, {
          type: "video/webm",
        });
        const [videoUrl, audioUrl] = await Promise.all([
          uploadVideo(file),
          uploadAudioToFirebase(blob, `audio_${mockId}_${Date.now()}.webm`),
        ]);
        await updateMockInterviewMedia(mockId, videoUrl, audioUrl);
        processAudioSubmission(mockId);
        router.push(ROUTES.MOCK_RESULT(mockId));
      } catch (error) {
        console.error("Error processing submission:", error);
        setIsProcessing(false);
        // Handle error (e.g., show error message to user)
      }
    }
  }, [isRecording, mockId, router]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    isProcessing,
    remainingTime,
    startRecording,
    stopRecording,
    isCountingDown,
    countdownTime,
  };
}
