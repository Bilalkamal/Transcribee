'use client';

import { useState, useCallback, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Copy, Download, Youtube, ClipboardPasteIcon as Paste, Clock, X, ChevronRight, ExternalLink} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { LoadingBee } from "@/components/loading-bee"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useDebouncedCallback } from 'use-debounce'
import { Skeleton } from "@/components/ui/skeleton"
import { useTranscriptionHistory } from '@/hooks/use-transcription-history'
import { TranscriptionProgress } from '@/components/TranscriptionProgress'
import { useTranscriptionProgress } from '@/hooks/useTranscriptionProgress'
import { type TranscriptionStatus } from '@/types/transcription'

export interface TranscriptResponse {
  status: string;
  video_id: string;
  video_title: string;
  video_duration?: string;
  transcription_raw: string;
  transcription: {
    text: string;
    segments: Array<{
      start: number;
      end: number;
      text: string;
    }>;
  };
}

const API_URL = '/api'

function getYouTubeVideoId(inputUrl: string): string | null {
  // If it's just a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(inputUrl)) {
    return inputUrl;
  }

  // Handle URLs without protocol
  const urlToCheck = inputUrl.startsWith('http') 
    ? inputUrl 
    : inputUrl.startsWith('www.') 
      ? `https://${inputUrl}`
      : `https://www.${inputUrl}`;
  
  try {
    const url = new URL(urlToCheck);
    const hostname = url.hostname.replace('www.', '');
    
    if (hostname === 'youtube.com') {
      return url.searchParams.get('v');
    } else if (hostname === 'youtu.be') {
      return url.pathname.substring(1);
    }
    
    // Check for video ID in partial URLs
    const videoIdMatch = inputUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return videoIdMatch ? videoIdMatch[1] : null;
  } catch (error) {
    // Check for video ID in partial URLs
    const videoIdMatch = inputUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return videoIdMatch ? videoIdMatch[1] : null;
  }
}

function formatDuration(duration: string) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 'N/A';

  const hours = match[1] ? match[1].replace('H', '') : '0';
  const minutes = match[2] ? match[2].replace('M', '') : '0';
  const seconds = match[3] ? match[3].replace('S', '') : '0';

  const parts = [];
  if (parseInt(hours) > 0) parts.push(hours.padStart(2, '0'));
  parts.push(minutes.padStart(2, '0'));
  parts.push(seconds.padStart(2, '0'));

  return parts.join(':');
}

function formatDurationFromSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Add this helper function to format YouTube duration
function formatYouTubeDuration(duration: string) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;

  const [_, hours, minutes, seconds] = match;
  const parts = [];

  if (hours) parts.push(hours.padStart(2, '0'));
  parts.push((minutes || '0').padStart(2, '0'));
  parts.push((seconds || '0').padStart(2, '0'));

  return parts.join(':');
}

// Update the getYouTubeVideoDuration function
async function getYouTubeVideoDuration(videoId: string): Promise<string | null> {
  try {
    // First try to get duration from oEmbed
    const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const oembedData = await oembedResponse.json();
    
    // If we can't get it from oEmbed, try our API route
    const response = await fetch(`/api/video-info?videoId=${videoId}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.duration || null;
  } catch (error) {
    console.error("Error fetching video duration:", error);
    return null;
  }
}

// Add this type for caching
interface CachedTranscript {
  timestamp: number;
  data: TranscriptResponse;
}

// Update the Features component to accept a className prop for better composition
const Features = ({ className }: { className?: string }) => (
  <div className={cn("container mx-auto px-4", className)}>
    <div className={cn(
      "grid gap-8 max-w-4xl mx-auto",
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3", // Responsive grid
      "px-4 sm:px-6 md:px-8" // Better padding on different screens
    )}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFF9E5] flex items-center justify-center mx-auto mb-3">
          <Youtube className="h-6 w-6 text-[#F2B705]" />
        </div>
        <h3 className="font-semibold mb-1.5">Chrome Extension</h3>
        <p className="text-sm text-muted-foreground">
          Our fastest way! One click or keyboard shortcut to transcribe any YouTube video
        </p>
        <a 
          href="https://chromewebstore.google.com/detail/transcribee-transcribe-yo/dcgbnpldgflkjmgmllfccokoinhhkhnl"
          target="_blank"
          className="inline-block mt-2 text-xs text-primary hover:underline"
        >
          Install Now →
        </a>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFF9E5] flex items-center justify-center mx-auto mb-3">
          <Download className="h-6 w-6 text-[#F2B705]" />
        </div>
        <h3 className="font-semibold mb-1.5">Multiple Formats</h3>
        <p className="text-sm text-muted-foreground">
          Download your transcripts in TXT, SRT, or VTT formats
        </p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFF9E5] flex items-center justify-center mx-auto mb-3">
          <ExternalLink className="h-6 w-6 text-[#F2B705]" />
        </div>
        <h3 className="font-semibold mb-1.5">Quick Access</h3>
        <p className="text-sm text-muted-foreground">
          Add transcrib.ee/ before any YouTube URL for instant transcription
        </p>
      </div>
    </div>
  </div>
);

// Add this utility function near the top with other formatting functions
function formatDurationDisplay(duration: string | number): string {
  // Handle when duration is already in HH:MM:SS format
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration;
  }

  // Convert to seconds if string
  const totalSeconds = typeof duration === 'string' 
    ? parseInt(duration)
    : duration;

  if (isNaN(totalSeconds)) {
    return 'N/A';
  }

  // Handle different time ranges
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const weeks = Math.floor(days / 7);

  // Format based on duration length
  if (weeks > 0) {
    return `${weeks}w ${days % 7}d ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  if (days > 0) {
    return `${days}d ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function HomePage({ initialUrl, skipHero }: { initialUrl?: string, skipHero?: boolean }) {
  const [url, setUrl] = useState(initialUrl || '')
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [characterCounts, setCharacterCounts] = useState<Record<string, number>>({
    txt: 0,
    srt: 0,
    vtt: 0,
  })
  const startTimeRef = useRef<number | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollCountRef = useRef<number>(0)
  const MAX_POLL_ATTEMPTS = 100
  const [videoDetails, setVideoDetails] = useState<{
    title?: string;
    duration?: string;
    thumbnail?: string;
  }>({});
  const [stats, setStats] = useState<Record<string, {
    words: number;
    characters: number;
  }>>({
    txt: { words: 0, characters: 0 },
    srt: { words: 0, characters: 0 },
    vtt: { words: 0, characters: 0 },
  });
  const [transcriptCache, setTranscriptCache] = useState<Record<string, CachedTranscript>>({})
  const CACHE_DURATION = 1000 * 60 * 60 // 1 hour
  const [isClientReady, setIsClientReady] = useState(false)
  const { history, addToHistory, removeFromHistory, clearHistory, count } = useTranscriptionHistory()
  const transcriptionProgress = useTranscriptionProgress(transcript?.status as TranscriptionStatus || 'processing');

  const formatTimestamp = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`
  }, [])

  const formatToSRT = useCallback((transcription: Array<{ start: number; end: number; text: string }>) => {
    return transcription.map((item, index) => {
      const startTime = formatTimestamp(item.start)
      const endTime = formatTimestamp(item.end)
      return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n\n`
    }).join('')
  }, [formatTimestamp])

  const formatToVTT = useCallback((transcription: Array<{ start: number; end: number; text: string }>) => {
    return 'WEBVTT\n\n' + transcription.map((item) => {
      const startTime = formatTimestamp(item.start)
      const endTime = formatTimestamp(item.end)
      return `${startTime} --> ${endTime}\n${item.text}\n\n`
    }).join('')
  }, [formatTimestamp])

  const isValidYoutubeUrl = useCallback((inputUrl: string) => {
    // If it's just a video ID (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(inputUrl)) {
      return true;
    }

    // Handle URLs without protocol
    const urlToCheck = inputUrl.startsWith('http') 
      ? inputUrl 
      : inputUrl.startsWith('www.') 
        ? `https://${inputUrl}`
        : `https://www.${inputUrl}`;
    
    try {
      const url = new URL(urlToCheck);
      const hostname = url.hostname.replace('www.', '');
      
      // Check for YouTube domains
      if (!['youtube.com', 'youtu.be'].includes(hostname)) {
        return false;
      }

      // Get video ID based on URL format
      let videoId = null;
      if (hostname === 'youtube.com') {
        videoId = url.searchParams.get('v');
      } else if (hostname === 'youtu.be') {
        videoId = url.pathname.substring(1);
      }

      // Validate video ID format
      return videoId ? /^[a-zA-Z0-9_-]{11}$/.test(videoId) : false;
    } catch (error) {
      // If URL parsing fails, check if the input might be a partial YouTube URL
      const videoIdMatch = inputUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return videoIdMatch ? true : false;
    }
  }, []);

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    pollCountRef.current = 0
  }, [])

  const pollTranscriptionStatus = useCallback(async (jobId: string) => {
    try {
      if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
        clearPolling();
        setError('Transcription timed out. Please try again.');
        setLoading(false);
        return;
      }

      pollCountRef.current += 1;
      const response = await fetch(`${API_URL}/transcribe/status/${jobId}`);
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTranscript(data);

      // If we have a complete transcript, stop polling and update history
      if ((data.status === 'completed' || data.status === 'success') && data.transcription?.segments) {
        setLoading(false);
        clearPolling();
        
        // Add to history when polling completes successfully
        addToHistory({
          videoId: getYouTubeVideoId(url) || '',
          videoTitle: data.video_title,
          thumbnail: `https://img.youtube.com/vi/${getYouTubeVideoId(url)}/mqdefault.jpg`,
          url: url,
          transcript: data,
          duration: videoDetails.duration || 'N/A',
          stats: {
            txt: {
              words: countWords(data.transcription_raw || ''),
              characters: (data.transcription_raw || '').length,
            },
            srt: {
              words: countWords(formatToSRT(data.transcription.segments || [])),
              characters: formatToSRT(data.transcription.segments || []).length,
            },
            vtt: {
              words: countWords(formatToVTT(data.transcription.segments || [])),
              characters: formatToVTT(data.transcription.segments || []).length,
            },
          },
        });

        toast({
          title: "Transcript fetched successfully",
          description: "Your transcript is ready!",
        });
        return;
      }

      // Continue polling if still processing
      if (['processing', 'accepted', 'pending'].includes(data.status)) {
        pollIntervalRef.current = setTimeout(() => pollTranscriptionStatus(jobId), 2000);
        return;
      }

      // Handle other cases
      clearPolling();
      setLoading(false);
      setError('Transcription failed or was cancelled');
      
    } catch (error) {
      console.error('Error polling status:', error);
      clearPolling();
      setError(error instanceof Error ? error.message : 'Failed to check transcription status');
      setLoading(false);
    }
  }, [clearPolling, toast, url, videoDetails.duration, addToHistory, formatToSRT, formatToVTT]);

  const fetchTranscript = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return;

    try {
      setLoading(true);
      setError(null);
      setTranscript(null);
      clearPolling();
      startTimeRef.current = performance.now();

      // Set initial video details
      setVideoDetails({
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        title: 'Loading...',
        duration: 'N/A',
      });

      // Fetch video details
      fetchVideoDetails(videoId).catch(console.error);

      const response = await fetch(`${API_URL}/transcribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtube_url: url }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTranscript(data);
      
      if (data.job_id) {
        toast({
          title: "Processing started",
          description: "Your transcript is being processed...",
        });
        pollTranscriptionStatus(data.job_id);
        return;
      }

      if ((data.status === 'completed' || data.status === 'success') && data.transcription?.segments) {
        setLoading(false);
        
        // Only add to history for immediate success (not when polling is needed)
        if (!data.job_id) {
          addToHistory({
            videoId: getYouTubeVideoId(url) || '',
            videoTitle: data.video_title,
            thumbnail: `https://img.youtube.com/vi/${getYouTubeVideoId(url)}/mqdefault.jpg`,
            url: url,
            transcript: data,
            duration: videoDetails.duration || 'N/A',
            stats: {
              txt: {
                words: countWords(data.transcription_raw || ''),
                characters: (data.transcription_raw || '').length,
              },
              srt: {
                words: countWords(formatToSRT(data.transcription.segments || [])),
                characters: formatToSRT(data.transcription.segments || []).length,
              },
              vtt: {
                words: countWords(formatToVTT(data.transcription.segments || [])),
                characters: formatToVTT(data.transcription.segments || []).length,
              },
            },
          });
        }

        toast({
          title: "Transcript fetched successfully",
          description: "Your transcript is ready!",
        });
      }

      // Add to cache after successful fetch
      if (data.status === 'completed' || data.status === 'success') {
        setTranscriptCache(prev => ({
          ...prev,
          [videoId]: {
            timestamp: Date.now(),
            data: data,
          }
        }));
      }
    } catch (error) {
      console.error('Error in fetchTranscript:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      setTranscript(null);
      setLoading(false);
      clearPolling();
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [url, toast, clearPolling, pollTranscriptionStatus, videoDetails.duration, addToHistory, formatToSRT, formatToVTT]);

  // Update the fetchVideoDetails function
  const fetchVideoDetails = async (videoId: string) => {
    try {
      const response = await fetch(`/api/video-info?videoId=${videoId}`);
      const data = await response.json();
      
      setVideoDetails(prev => ({
        ...prev,
        title: data.title || 'Untitled Video',
        duration: formatDurationDisplay(data.duration) || 'N/A',
      }));
    } catch (error) {
      console.error('Error fetching video details:', error);
      setVideoDetails(prev => ({
        ...prev,
        title: 'Could not load title',
        duration: 'N/A',
      }));
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "The transcript has been copied to your clipboard.",
    })
  }, [toast])

  const downloadTranscript = useCallback((content: string, format: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const fileUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = `transcript.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(fileUrl)
    toast({
      title: `Downloaded transcript.${format}`,
      description: "Your transcript has been downloaded.",
    })
  }, [toast])

  function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  useEffect(() => {
    if (transcript?.status === 'completed' || transcript?.status === 'success') {
      const txtText = transcript?.transcription_raw || '';
      const srtText = transcript?.transcription?.segments 
        ? formatToSRT(transcript.transcription.segments)
        : '';
      const vttText = transcript?.transcription?.segments 
        ? formatToVTT(transcript.transcription.segments)
        : '';

      setStats({
        txt: {
          words: countWords(txtText),
          characters: txtText.length,
        },
        srt: {
          words: countWords(srtText),
          characters: srtText.length,
        },
        vtt: {
          words: countWords(vttText),
          characters: vttText.length,
        },
      });
    }
  }, [transcript, formatToSRT, formatToVTT]);

  useEffect(() => {
    if (initialUrl && isValidYoutubeUrl(initialUrl)) {
      const syntheticEvent = new Event('submit') as unknown as React.FormEvent
      fetchTranscript(syntheticEvent)
    }
  }, [initialUrl])

  // Replace isValidYoutubeUrl with debounced version
  const debouncedValidation = useDebouncedCallback(
    (inputUrl: string) => {
      const isValid = isValidYoutubeUrl(inputUrl);
      if (!isValid && inputUrl) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid YouTube URL or video ID",
          variant: "destructive",
        });
      }
    },
    500 // 500ms delay
  );

  // Update URL change handler
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    debouncedValidation(e.target.value);
  };

  // Add this effect to handle initial hydration
  useEffect(() => {
    setIsClientReady(true)
  }, [])

  // Update the renderHistory function to only handle history
  const renderHistory = () => {
    if (history.length === 0) {
      return null;
    }

    return (
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transcriptions</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-sm text-muted-foreground"
          >
            Clear History
          </Button>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {history.map((item) => (
            <div
              key={item.id}
              className="group relative flex items-center gap-4 p-3 bg-card rounded-lg border hover:border-primary transition-colors cursor-pointer touch-manipulation"
              onClick={() => {
                setUrl(item.url);
                setTranscript(item.transcript);
                setVideoDetails({
                  thumbnail: item.thumbnail,
                  title: item.videoTitle,
                  duration: item.duration,
                });
                setStats(item.stats);
              }}
            >
              <div className="w-20 h-12 rounded overflow-hidden flex-shrink-0">
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-1 text-sm md:text-base">
                  {item.videoTitle}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <button
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFromHistory(item.id)
                }}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col bee-cursor">
      <div className="fixed inset-0 gradient-animation opacity-30 pointer-events-none" />
      
      <Header />
      
      <main className="flex-grow relative z-10 flex flex-col">
        <div className="container mx-auto px-4 py-6 md:py-12 flex-grow flex flex-col">
          {/* Hero Section - only show if not skipHero */}
          {!skipHero && (
            <div className="max-w-2xl mx-auto text-center mb-6 md:mb-8 fade-enter-active">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 hover-glow">
                Transcribe YouTube Videos with Ease
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-4">
                From Hive to Text, Transcribing at Its Best
              </p>
              <div className="flex gap-2 justify-center mb-8">
                <Badge variant="secondary" className="hover-lift">TXT</Badge>
                <Badge variant="secondary" className="hover-lift">SRT</Badge>
                <Badge variant="secondary" className="hover-lift">VTT</Badge>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-grow flex flex-col">
            {/* Transcription Input and Results */}
            <div className="container mx-auto px-4 flex-grow flex flex-col">
              {/* Main Form Section */}
              <div className="max-w-2xl mx-auto w-full">
                <form onSubmit={fetchTranscript} className="space-y-4 fade-enter-active">
                  <div className="enhanced-input-container relative p-1">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="Enter YouTube URL"
                      value={url}
                      onChange={handleUrlChange}
                      className={cn(
                        "pl-10 pr-24 h-12 border-0 bg-transparent focus-visible:ring-0",
                        !isValidYoutubeUrl(url) && url && "text-destructive"
                      )}
                      required
                      disabled={loading}
                      aria-label="YouTube URL input"
                      aria-invalid={!isValidYoutubeUrl(url) && url ? "true" : "false"}
                      aria-describedby={!isValidYoutubeUrl(url) && url ? "url-error" : undefined}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.readText().then(text => setUrl(text))
                      }}
                    >
                      <Paste className="h-4 w-4 mr-2" />
                      Paste
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={!isClientReady || loading || !isValidYoutubeUrl(url)}
                    className="w-full bg-[#F2B705] hover:bg-[#F2B705]/90 text-[#1E252C] font-medium hover-lift"
                  >
                    {loading ? (
                      "Transcribing..."
                    ) : (
                      "Transcribe Now"
                    )}
                  </Button>
                </form>

                {/* Results Section */}
                {transcript && (
                  <div className="mt-4 fade-enter-active">
                    <Card className="bg-card border-border shadow-2xl backdrop-blur-xl hover-glow high-contrast">
                      {/* Video Info Header */}
                      <div className="p-4 border-b">
                        <div className="flex items-start gap-4">
                          <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden">
                            {videoDetails.thumbnail && (
                              <img
                                src={videoDetails.thumbnail}
                                alt={`Thumbnail for ${transcript?.video_title || videoDetails.title || 'video'}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold line-clamp-2">
                              {transcript?.video_title || videoDetails.title || "Loading video details..."}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Video ID: {transcript?.video_id || getYouTubeVideoId(url) || 'Loading...'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tabs Section */}
                      <Tabs defaultValue="txt" className="p-4">
                        <TabsList className="grid w-full grid-cols-3 bg-muted rounded-lg p-1">
                          <TabsTrigger value="txt" className="text-foreground data-[state=active]:bg-accent rounded transition-all duration-200">
                            TXT
                          </TabsTrigger>
                          <TabsTrigger value="srt" className="text-foreground data-[state=active]:bg-accent rounded transition-all duration-200">
                            SRT
                          </TabsTrigger>
                          <TabsTrigger value="vtt" className="text-foreground data-[state=active]:bg-accent rounded transition-all duration-200">
                            VTT
                          </TabsTrigger>
                        </TabsList>

                        {(['txt', 'srt', 'vtt'] as const).map((format) => (
                          <TabsContent key={format} value={format} className="mt-4">
                            <div className="relative">
                              <div className="bg-muted/50 rounded-lg p-4 min-h-[200px]">
                                {loading || ['processing', 'accepted', 'pending'].includes(transcript?.status || '') ? (
                                  <div className="flex flex-col items-center justify-center h-full">
                                    <TranscriptionProgress 
                                      status={transcript?.status as TranscriptionStatus || 'processing'}
                                      progress={transcriptionProgress}
                                      className="mb-4"
                                    />
                                  </div>
                                ) : (
                                  <pre className="text-sm text-foreground whitespace-pre-wrap overflow-auto max-h-[200px] custom-scrollbar">
                                    {format === 'txt' 
                                      ? transcript?.transcription_raw || ''
                                      : format === 'srt'
                                      ? formatToSRT(transcript?.transcription?.segments || [])
                                      : formatToVTT(transcript?.transcription?.segments || [])}
                                  </pre>
                                )}
                              </div>
                              
                              {/* Stats Footer */}
                              <div className="flex flex-col gap-4 mt-4">
                                {/* Stats Row */}
                                <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-4">
                                  <div className="flex items-center gap-4">
                                    <span>Words: {stats[format]?.words?.toLocaleString() || 0}</span>
                                    <span>Characters: {stats[format]?.characters?.toLocaleString() || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{videoDetails?.duration || 'N/A'}</span>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4">
                                  <Button
                                    size="lg"
                                    className="w-full bg-[#F2B705] hover:bg-[#F2B705]/90 text-[#1E252C] font-medium"
                                    onClick={() => copyToClipboard(
                                      format === 'txt'
                                        ? transcript?.transcription_raw || ''
                                        : format === 'srt'
                                        ? formatToSRT(transcript?.transcription?.segments || [])
                                        : formatToVTT(transcript?.transcription?.segments || [])
                                    )}
                                    disabled={loading}
                                    aria-label={`Copy ${format.toUpperCase()} transcript`}
                                  >
                                    <Copy className="h-5 w-5 mr-2" aria-hidden="true" />
                                    <span>Copy Transcript</span>
                                  </Button>
                                  <Button
                                    size="lg"
                                    className="w-full bg-[#F2A30F] hover:bg-[#F2A30F]/90 text-[#1E252C] font-medium"
                                    onClick={() => downloadTranscript(
                                      format === 'txt'
                                        ? transcript?.transcription_raw || ''
                                        : format === 'srt'
                                        ? formatToSRT(transcript?.transcription?.segments || [])
                                        : formatToVTT(transcript?.transcription?.segments || []),
                                      format
                                    )}
                                    disabled={loading}
                                  >
                                    <Download className="h-5 w-5 mr-2" />
                                    Download {format.toUpperCase()}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </Card>
                  </div>
                )}

                {error && !loading && (
                  <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/30">
                    {error}
                  </div>
                )}

                {/* History Section with animation */}
                {history.length > 0 && (
                  <div className="mt-6 fade-enter-active">
                    {renderHistory()}
                  </div>
                )}
              </div>

              {/* Features Section with improved spacing */}
              {!transcript && !skipHero && (
                <div className={cn(
                  "mt-auto", // Push to bottom
                  history.length === 0 
                    ? "flex-grow flex items-center py-16 md:py-24" // Center vertically when no history
                    : "mt-8 pb-8" // Normal spacing when history exists
                )}>
                  <Features />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
