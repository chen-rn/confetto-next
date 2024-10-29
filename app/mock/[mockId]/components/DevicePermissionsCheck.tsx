import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, Mic } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface DevicePermission {
  audio: boolean | null;
  video: boolean | null;
  error?: string;
}

interface DevicePermissionsCheckProps {
  onPermissionsGranted: () => void;
}

export function DevicePermissionsCheck({ onPermissionsGranted }: DevicePermissionsCheckProps) {
  const [permissions, setPermissions] = useState<DevicePermission>({
    audio: null,
    video: null,
  });

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissions({ audio: true, video: true });
      onPermissionsGranted();
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      const newPermissions: DevicePermission = { audio: false, video: false };

      if (error.name === "NotAllowedError") {
        newPermissions.error =
          "Camera and microphone access was denied. Please allow access in your browser settings.";
      } else if (error.name === "NotFoundError") {
        newPermissions.error =
          "No camera or microphone found. Please connect your devices and try again.";
      } else {
        newPermissions.error =
          "An error occurred while accessing your devices. Please check your connections and try again.";
      }

      setPermissions(newPermissions);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-[#635BFF] to-[#504ACC] bg-clip-text text-transparent">
              Device Permissions Required
            </CardTitle>
            <p className="text-neutral-500 mt-2 text-sm">
              Please allow access to your camera and microphone to record your interview responses
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100"
              >
                <div className="w-12 h-12 rounded-full bg-[#635BFF]/10 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-[#635BFF]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">Camera Access</p>
                  <p className="text-sm text-neutral-500">Required for video recording</p>
                </div>
                {permissions.video === true && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-500/20"
                  />
                )}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100"
              >
                <div className="w-12 h-12 rounded-full bg-[#635BFF]/10 flex items-center justify-center">
                  <Mic className="h-6 w-6 text-[#635BFF]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">Microphone Access</p>
                  <p className="text-sm text-neutral-500">Required for audio recording</p>
                </div>
                {permissions.audio === true && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-500/20"
                  />
                )}
              </motion.div>
            </div>

            {permissions.error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Permission Error</AlertTitle>
                  <AlertDescription>{permissions.error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <Button
                onClick={checkPermissions}
                className="w-full h-12 bg-[#635BFF] hover:bg-[#5a52f0] shadow-lg shadow-[#635BFF]/25 hover:shadow-xl hover:shadow-[#635BFF]/20 transition-all duration-200"
              >
                Allow Access
              </Button>

              {permissions.error && (
                <p className="text-sm text-center text-neutral-500 px-6">
                  If you denied permissions, you&apos;ll need to allow them in your browser settings
                  and refresh the page.
                </p>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
