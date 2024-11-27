"use client";

import { useEffect } from 'react';

export function VideoPreloader() {
  useEffect(() => {
    const videoUrls = [
      '/videos/initial.mp4',
      '/videos/talking.mp4',
      '/videos/idle.mp4'
    ];

    videoUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = url;
      document.head.appendChild(link);

      // Also create video elements to trigger loading
      const video = document.createElement('video');
      video.style.display = 'none';
      video.preload = 'auto';
      video.src = url;
      document.body.appendChild(video);

      // Clean up
      return () => {
        document.head.removeChild(link);
        document.body.removeChild(video);
      };
    });
  }, []);

  return null;
}
