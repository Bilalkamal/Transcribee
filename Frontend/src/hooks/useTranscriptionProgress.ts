import { useState, useEffect, useRef } from 'react';
import { type TranscriptionStatus } from '@/types/transcription';

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function customEase(x: number): number {
  if (x > 0.85) {
    return 0.85 + (x - 0.85) * 0.3;
  }
  return x;
}

export function useTranscriptionProgress(status: TranscriptionStatus, videoLengthInSeconds: number = 600) {
  const [progress, setProgress] = useState(0);
  const prevStatusRef = useRef<TranscriptionStatus | null>(null);
  const currentProgressRef = useRef(0);
  const animationFrameIdRef = useRef<number>();
  const isInitialRender = useRef(true);
  const prevVideoLengthRef = useRef(videoLengthInSeconds);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  // Immediate reset when status changes to 'accepted' (new transcription)
  useEffect(() => {
    if (status === 'accepted') {
      currentProgressRef.current = 0;
      setProgress(0);
      isInitialRender.current = true;
      prevStatusRef.current = null;
    }
  }, [status]);

  // Reset state after completion
  useEffect(() => {
    if (status === 'succeeded' || status === 'failed') {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      resetTimeoutRef.current = setTimeout(() => {
        currentProgressRef.current = 0;
        setProgress(0);
        isInitialRender.current = true;
        prevStatusRef.current = null;
      }, 100);
    }

    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [status]);

  useEffect(() => {
    const cleanup = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = undefined;
      }
    };

    // Reset progress when video length changes (new video)
    if (prevVideoLengthRef.current !== videoLengthInSeconds) {
      cleanup();
      currentProgressRef.current = 0;
      setProgress(0);
      isInitialRender.current = true;
      prevStatusRef.current = null;
      prevVideoLengthRef.current = videoLengthInSeconds;
      return;
    }

    const getTargetProgress = (currentStatus: TranscriptionStatus): number => {
      switch (currentStatus) {
        case 'accepted': return 5;
        case 'pending': return 15;
        case 'processing': return 99;
        case 'succeeded': return 100;
        case 'failed': return 100;
        default: return 0;
      }
    };

    // Handle status change
    if (status !== prevStatusRef.current) {
      cleanup();
      
      let startTime: number | null = null;
      const startProgress = status === 'accepted' ? 0 : currentProgressRef.current; // Force start from 0 for new transcriptions
      const targetProgress = getTargetProgress(status);

      // Duration calculation
      const getDuration = () => {
        if (status === 'succeeded' || status === 'failed') {
          return 500;
        }

        const getBaseDuration = () => {
          if (videoLengthInSeconds <= 60) {
            return 15000;
          }
          if (videoLengthInSeconds <= 300) {
            return 25000;
          }
          if (videoLengthInSeconds <= 900) {
            return 40000;
          }
          if (videoLengthInSeconds <= 1800) {
            return 60000;
          }
          return Math.min(videoLengthInSeconds * 50, 120000);
        };

        const baseDuration = getBaseDuration();
        const progressDiff = Math.abs(targetProgress - startProgress);
        const duration = (baseDuration * progressDiff) / 100;
        
        if (startProgress > 85) {
          return duration * 2;
        }
        
        return duration;
      };

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const duration = getDuration();
        const rawProgressRatio = Math.min(elapsed / duration, 1);
        const progressRatio = customEase(rawProgressRatio);
        
        const newProgress = startProgress + 
          (targetProgress - startProgress) * easeOutCubic(progressRatio);
        
        currentProgressRef.current = newProgress;
        setProgress(Math.min(Math.max(0, newProgress), 100));
        
        if (rawProgressRatio < 1 && status !== 'succeeded' && status !== 'failed') {
          animationFrameIdRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameIdRef.current = requestAnimationFrame(animate);
      prevStatusRef.current = status;
    }

    return cleanup;
  }, [status, videoLengthInSeconds]);

  return Math.round(progress);
}