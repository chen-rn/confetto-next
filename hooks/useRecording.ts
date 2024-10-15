import { useCallback, useRef } from "react";
import { useSetAtom } from "jotai";
import { getSupportedMimeType } from "@/utils/mediaUtils";
import { uploadVideo, uploadAudioToFirebase } from "@/lib/apis/firebase";
import { updateMockInterviewMedia } from "@/lib/actions/updateMockInterviewMedia";
import { processAudioSubmission } from "@/lib/actions/processAudioSubmission";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { isRecordingAtom, isProcessingAtom } from "@/lib/atoms/interviewAtoms";
import { useToast } from "@/hooks/use-toast";

export function useRecording(mockId: string) {
  const setIsRecording = useSetAtom(isRecordingAtom);
  const setIsProcessing = useSetAtom(isProcessingAtom);
  const router = useRouter();
  const { toast } = useToast();

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
      initializeRecording(stream);

      try {
        if (!recorderRef.current) {
          throw new Error("MediaRecorder not initialized");
        }

        recorderRef.current.start(1000);
        console.log("MediaRecorder started");

        setIsRecording(true);
        toast({
          title: "Recording Started",
          description: "Your interview is now being recorded.",
        });
      } catch (error) {
        console.error("Error starting recording:", error);
        toast({
          title: "Recording Error",
          description: "Failed to start recording. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [initializeRecording, setIsRecording, toast]
  );

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    setIsProcessing(true);
    toast({
      title: "Processing",
      description: "Your interview is being processed. Please wait...",
    });

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
      const file = new File([blob], `video_${mockId}_${Date.now()}.webm`, {
        type: "video/webm",
      });
      const [videoUrl, audioUrl] = await Promise.all([
        uploadVideo(file),
        uploadAudioToFirebase(blob, `audio_${mockId}_${Date.now()}.webm`),
      ]);
      await updateMockInterviewMedia(mockId, videoUrl, audioUrl);
      processAudioSubmission(mockId);

      await new Promise((resolve) => setTimeout(resolve, 200));
      router.push(ROUTES.MOCK_RESULT(mockId));
    } catch (error) {
      console.error("Error processing submission:", error);
      setIsProcessing(false);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing your interview. Please try again.",
        variant: "destructive",
      });
    }
  }, [mockId, router, setIsRecording, setIsProcessing, toast]);

  return {
    startRecording,
    stopRecording,
  };
}
