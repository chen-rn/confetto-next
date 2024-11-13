import { useState, useCallback, useEffect } from "react";

interface PermissionsState {
  hasPermissions: boolean | null;
  lastChecked?: number | null;
}

export function useDevicePermissions() {
  const [permissionsState, setPermissionsState] = useState<PermissionsState>({
    hasPermissions: null,
    lastChecked: null,
  });

  const checkPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach((track) => track.stop());

      setPermissionsState({
        hasPermissions: true,
        lastChecked: Date.now(),
      });
      return true;
    } catch (error) {
      setPermissionsState({
        hasPermissions: false,
        lastChecked: Date.now(),
      });
      return false;
    }
  }, []);

  useEffect(() => {
    if (permissionsState.hasPermissions === null) {
      checkPermissions();
    }
  }, [checkPermissions, permissionsState.hasPermissions]);

  return {
    permissionsState,
    setPermissionsState,
    checkPermissions,
  };
}
