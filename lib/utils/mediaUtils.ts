export function getSupportedMimeType(...mimeTypes: string[]) {
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  console.warn("No supported MIME type found");
  return "";
}
