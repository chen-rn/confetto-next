import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useMediaSetup() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    async function setupMedia() {
      try {
        if (!window.isSecureContext) {
          throw new Error("Media devices can only be accessed in a secure context (HTTPS)");
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("getUserMedia is not supported in this browser");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: {
            channelCount: 1,
            sampleRate: 44100,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setHasPermission(true);
      } catch (error) {
        setHasPermission(false);
        const errorMessage = (error as Error).message || "Failed to access camera and microphone";
        setError(errorMessage);
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
    };
  }, [toast]);

  return { hasPermission, error, videoRef };
}
