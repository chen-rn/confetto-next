import { useState, useEffect } from "react";

export function useAudioLevel(stream: MediaStream | null) {
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 128); // Normalize to 0-1 range
      requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();

    return () => {
      microphone.disconnect();
      audioContext.close();
    };
  }, [stream]);

  return audioLevel;
}
