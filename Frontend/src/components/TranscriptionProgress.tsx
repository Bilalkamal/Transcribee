import React from 'react';
import { cn } from "@/lib/utils";
import { type TranscriptionStatus } from '@/types/transcription'
import { useTranscriptionProgress } from '@/hooks/useTranscriptionProgress';


interface TranscriptionProgressProps {
  status: TranscriptionStatus;
  progress?: number;
  className?: string;
  videoLengthInSeconds?: number;
}

export function TranscriptionProgress({ 
  status, 
  progress: externalProgress, 
  className,
  videoLengthInSeconds = 600 
}: TranscriptionProgressProps) {
  const calculatedProgress = useTranscriptionProgress(status, videoLengthInSeconds);
  const normalizedProgress = Math.min(100, Math.max(0, externalProgress ?? calculatedProgress ?? 0));

  const getStatusColor = (status: TranscriptionStatus) => {
    switch (status) {
      case 'accepted':
      case 'pending':
      case 'processing':
        return 'stroke-[#F2B705] text-[#F2B705] dark:stroke-[#F2B705] dark:text-[#F2B705]';
      case 'succeeded':
        return 'stroke-green-500 text-green-500 dark:stroke-green-400 dark:text-green-400';
      case 'failed':
        return 'stroke-red-500 text-red-500 dark:stroke-red-400 dark:text-red-400';
      default:
        return 'stroke-gray-500 text-gray-500 dark:stroke-gray-400 dark:text-gray-400';
    }
  };

  const getStatusMessage = (status: TranscriptionStatus) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'succeeded':
        return 'Complete!';
      case 'failed':
        return 'Failed';
      default:
        return '';
    }
  };

  // Adjusted size calculations
  const size = 160;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = ((100 - normalizedProgress) / 100) * circumference;

  return (
    <div className={cn("relative flex flex-col items-center justify-center h-full text-center", className)}>
      <div className={cn("relative w-40 h-40")}>
        <svg 
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 160 160"
        >
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="fill-none stroke-gray-200 dark:stroke-gray-700"
            strokeWidth="8"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={cn("fill-none transition-all duration-300 ease-in-out", getStatusColor(status))}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease-out',
            }}
          />
        </svg>
        {/* Centered text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold mb-1">
            {Math.round(normalizedProgress)}%
          </span>
          <span className={cn("text-base font-semibold mt-2", getStatusColor(status))}>
            {getStatusMessage(status)}
          </span>
        </div>
      </div>
    </div>
  );
}