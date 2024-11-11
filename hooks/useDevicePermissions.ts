import { useEffect } from "react";
import { useAtom } from "jotai";
import { devicePermissionsAtom } from "@/lib/atoms/permissions";

const PERMISSIONS_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export function useDevicePermissions() {
  const [permissionsState, setPermissionsState] = useAtom(devicePermissionsAtom);

  const checkPermissions = async () => {
    const now = Date.now();
    const currentState = permissionsState;

    if (
      currentState.hasPermissions !== null &&
      currentState.lastChecked &&
      now - currentState.lastChecked < PERMISSIONS_CACHE_DURATION
    ) {
      return currentState.hasPermissions;
    }

    try {
      const permissions = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      permissions.getTracks().forEach((track) => track.stop());

      setPermissionsState({
        hasPermissions: true,
        lastChecked: now,
      });
      return true;
    } catch (error) {
      setPermissionsState({
        hasPermissions: false,
        lastChecked: now,
      });
      return false;
    }
  };

  return {
    permissionsState,
    checkPermissions,
    setPermissionsState,
  };
}
