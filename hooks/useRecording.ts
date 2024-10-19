import { useCallback, useRef } from "react";
import { useSetAtom, useAtom } from "jotai";
import { getSupportedMimeType } from "@/utils/mediaUtils";
import { uploadVideo, uploadAudioToFirebase } from "@/lib/apis/firebase";
import { updateMockInterviewMedia } from "@/lib/actions/updateMockInterviewMedia";
import { processAudioSubmission } from "@/lib/actions/processAudioSubmission";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { isRecordingAtom, isProcessingAtom, isUploadingAtom } from "@/lib/atoms/interviewAtoms";
import { useToast } from "@/hooks/use-toast";

export function useRecording(mockId: string) {
  const setIsRecording = useSetAtom(isRecordingAtom);
  const setIsProcessing = useSetAtom(isProcessingAtom);
  const [isUploading, setIsUploading] = useAtom(isUploadingAtom);
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
    if (isUploading) {
      toast({
        title: "Upload in Progress",
        description: "Please wait for the current upload to finish.",
      });
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);
    setIsUploading(true);
    toast({
      title: "Processing",
      description: "Your interview is being processed. Please leave this page open!",
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

      // Navigate to the results page immediately
      router.push(ROUTES.MOCK_RESULT(mockId));

      // Continue with the upload in the background
      const [videoUrl, audioUrl] = await Promise.all([
        uploadVideo(file),
        uploadAudioToFirebase(blob, `audio_${mockId}_${Date.now()}.webm`),
      ]);
      await updateMockInterviewMedia(mockId, videoUrl, audioUrl);
      await processAudioSubmission(mockId);

      setIsUploading(false);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing submission:", error);
      setIsUploading(false);
      setIsProcessing(false);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing your interview. Please try again.",
        variant: "destructive",
      });
    }
  }, [mockId, router, setIsRecording, setIsProcessing, setIsUploading, isUploading, toast]);

  return {
    startRecording,
    stopRecording,
  };
}
