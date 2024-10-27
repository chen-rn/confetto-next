import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";

export const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const storage = getStorage(app);

export async function uploadAudioToFirebase(audioBlob: Blob, extension: string): Promise<string> {
  const fileName = `audio_${Date.now()}.${extension}`;
  const storageRef = ref(storage, `recordings/${fileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, audioBlob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading audio to Firebase:", error);
    throw error;
  }
}

export async function uploadVideo(file: File): Promise<string> {
  const storageRef = ref(storage, `mock-interviews/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
