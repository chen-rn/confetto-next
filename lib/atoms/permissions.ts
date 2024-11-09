import { atomWithStorage } from "jotai/utils";

interface PermissionsState {
  hasPermissions: boolean | null;
  lastChecked: number | null;
}

const PERMISSIONS_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const devicePermissionsAtom = atomWithStorage<PermissionsState>("devicePermissions", {
  hasPermissions: null,
  lastChecked: null,
});
