import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebaseConfig"; // Make sure to create this file with your Firebase configuration

const storage = getStorage(app);

export async function uploadAudioToFirebase(audioBlob: Blob, sessionId: string): Promise<string> {
  const fileName = `audio_${sessionId}_${Date.now()}.mp3`;
  const storageRef = ref(storage, `recordings/${fileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, audioBlob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading to Firebase:", error);
    throw error;
  }
}
