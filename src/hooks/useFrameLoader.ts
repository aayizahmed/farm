import { useState, useEffect } from 'react';

export function useFrameLoader(frameCount: number, basePath: string = '/frames/frame_', extension: string = '.webp') {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loaded = 0;

    // We can prioritize loading the first 20 frames
    const preloadPriority = 20;

    const loadFrame = (i: number) => {
      const img = new Image();
      const frameNum = i.toString().padStart(4, '0');
      img.src = `${basePath}${frameNum}${extension}`;
      
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
      };
      
      loadedImages[i - 1] = img;
    };

    // Load priority frames first
    for (let i = 1; i <= Math.min(preloadPriority, frameCount); i++) {
      loadFrame(i);
    }

    // Load remaining frames asynchronously
    if (frameCount > preloadPriority) {
      setTimeout(() => {
        for (let i = preloadPriority + 1; i <= frameCount; i++) {
          loadFrame(i);
        }
      }, 100);
    }

    setImages(loadedImages);
  }, [frameCount, basePath, extension]);

  return { images, loadedCount, progress: loadedCount / frameCount };
}
