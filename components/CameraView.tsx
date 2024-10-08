"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { uploadVideo, uploadAudioToFirebase } from "@/lib/apis/firebase";
import { saveVideoAndAudioReference } from "@/app/actions/mockInterview";
import { processAudioSubmission } from "@/lib/actions/processAudioSubmission";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";

interface CameraViewProps {
  mockId: string;
  maxRecordingTime?: number; // in seconds
}

function getSupportedMimeType(...mimeTypes: string[]) {
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return "";
}

export function CameraView({ mockId, maxRecordingTime = 300 }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [remainingTime, setRemainingTime] = useState(maxRecordingTime);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function setupMedia() {
      try {
        if (!window.isSecureContext) {
          const errorMessage = "Media devices can only be accessed in a secure context (HTTPS)";
          toast({
            title: "Security Error",
            description: errorMessage,
            variant: "destructive",
          });
          throw new Error(errorMessage);
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          const errorMessage = "getUserMedia is not supported in this browser";
          toast({
            title: "Browser Support Error",
            description: errorMessage,
            variant: "destructive",
          });
          throw new Error(errorMessage);
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setHasPermission(false);
        setError((error as Error).message || "Failed to access camera and microphone");
        toast({
          title: "Error",
          description: "Failed to access camera and microphone. Please check your permissions.",
          variant: "destructive",
        });
      }
    }

    setupMedia();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [toast]);

  function startRecording() {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const audioTracks = stream.getAudioTracks();

    if (audioTracks.length === 0) {
      console.error("No audio tracks available in the stream.");
      return;
    }

    const audioStream = new MediaStream(audioTracks);

    const videoMimeType = getSupportedMimeType(
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4"
    );

    const audioMimeType = getSupportedMimeType(
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
      "audio/mp4"
    );

    if (!videoMimeType || !audioMimeType) {
      console.error("No supported MIME types for recording.");
      return;
    }

    const videoOptions: MediaRecorderOptions = {
      mimeType: videoMimeType,
    };
    const audioOptions: MediaRecorderOptions = {
      mimeType: audioMimeType,
    };

    mediaRecorderRef.current = new MediaRecorder(stream, videoOptions);
    audioRecorderRef.current = new MediaRecorder(audioStream, audioOptions);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log("Video data available:", event.data.size);
        chunksRef.current.push(event.data);
      } else {
        console.warn("No video data available");
      }
    };

    audioRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log("Audio data available:", event.data.size);
        audioChunksRef.current.push(event.data);
      } else {
        console.warn("No audio data available");
      }
    };

    mediaRecorderRef.current.start();
    audioRecorderRef.current.start();
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
  }

  async function stopRecording() {
    if (!mediaRecorderRef.current || !audioRecorderRef.current || !isRecording) return;

    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsUploading(true);

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        audioRecorderRef.current!.onstop = async () => {
          try {
            console.log("Video chunks:", chunksRef.current.length);
            console.log("Audio chunks:", audioChunksRef.current.length);

            const videoBlob = new Blob(chunksRef.current, {
              type: mediaRecorderRef.current!.mimeType,
            });
            const audioBlob = new Blob(audioChunksRef.current, {
              type: audioRecorderRef.current!.mimeType,
            });

            console.log("Video blob size:", videoBlob.size);
            console.log("Audio blob size:", audioBlob.size);

            if (videoBlob.size === 0 || audioBlob.size === 0) {
              throw new Error("Recorded media is empty.");
            }

            const videoFile = new File([videoBlob], `mock_video_${mockId}_${Date.now()}.webm`, {
              type: mediaRecorderRef.current!.mimeType,
            });
            const audioFile = new File([audioBlob], `mock_audio_${mockId}_${Date.now()}.webm`, {
              type: audioRecorderRef.current!.mimeType,
            });

            const videoUrl = await uploadVideo(videoFile);
            const audioUrl = await uploadAudioToFirebase(audioFile, mockId, "webm");

            await saveVideoAndAudioReference(mockId, videoUrl, audioUrl);
            await processAudioSubmission(audioUrl, mockId);

            router.push(ROUTES.MOCK_RESULT(mockId));
          } catch (error) {
            console.error("Error processing and uploading media:", error);
          } finally {
            chunksRef.current = [];
            audioChunksRef.current = [];
            setIsUploading(false);
            resolve();
          }
        };

        audioRecorderRef.current!.stop();
      };

      mediaRecorderRef.current!.stop();
    });
  }

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4 bg-gray-100">
        <p className="text-red-500">{error}</p>
        <p>
          Please ensure you're using a supported browser and have granted the necessary permissions.
        </p>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        Requesting camera and microphone permission...
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        Access denied. Please enable camera and microphone permissions.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-100">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg transform scale-x-[-1]"
      />
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <Button
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          className="px-8 py-4 text-md mb-2"
          disabled={isUploading}
        >
          {isUploading ? "Processing..." : isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        <div className="text-white text-lg font-semibold">{formatTime(remainingTime)}</div>
      </div>
      {isRecording && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center text-sm">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-blink" />
          Recording
        </div>
      )}
    </div>
  );
}
