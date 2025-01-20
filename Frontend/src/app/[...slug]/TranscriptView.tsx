'use client';

import { useState, useEffect, useRef, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download } from 'lucide-react'
// import { LoadingBee } from "@/components/ui/loading-bee"
import { TranscriptionProgress } from '@/components/TranscriptionProgress'

interface TranscriptViewProps {
  initialUrl: string
}

interface TranscriptResponse {
  status: 'processing' | 'accepted' | 'success' | 'completed' | 'failed';
  job_id?: string;
  error?: string;
  video_id?: string;
  video_title?: string;
  transcription_raw?: string;
  transcription?: {
    text: string;
    segments: Array<{
      start: number;
      end: number;
      text: string;
    }>;
  };
}

function formatToSRT(transcription: Array<{ start: number; end: number; text: string }>) {
  return transcription.map((item, index) => {
    const startTime = formatTimestamp(item.start)
    const endTime = formatTimestamp(item.end)
    return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n\n`
  }).join('')
}

function formatToVTT(transcription: Array<{ start: number; end: number; text: string }>) {
  return 'WEBVTT\n\n' + transcription.map((item) => {
    const startTime = formatTimestamp(item.start)
    const endTime = formatTimestamp(item.end)
    return `${startTime} --> ${endTime}\n${item.text}\n\n`
  }).join('')
}

function formatTimestamp(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

export default function TranscriptView({ initialUrl }: TranscriptViewProps) {
  const [transcript, setTranscript] = useState<TranscriptResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [characterCounts, setCharacterCounts] = useState<Record<string, number>>({
    txt: 0,
    srt: 0,
    vtt: 0,
  })

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollCountRef = useRef<number>(0)
  const hasInitialRequestRef = useRef<boolean>(false)
  const hasValidDataRef = useRef<boolean>(false)
  const MAX_POLL_ATTEMPTS = 100
  const [transcriptionStatus, setTranscriptionStatus] = useState<'accepted' | 'pending' | 'processing' | 'succeeded' | 'failed'>('processing')

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    pollCountRef.current = 0
  }, [])

  const pollTranscriptionStatus = useCallback(async (jobId: string) => {
    if (!jobId || hasValidDataRef.current) {
      console.log('Stopping poll: ', hasValidDataRef.current ? 'Valid data received' : 'No job ID');
      clearPolling();
      return;
    }

    try {
      console.log(`Polling attempt ${pollCountRef.current + 1} for job ${jobId}`);
      
      if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
        console.log('Max polling attempts reached');
        clearPolling();
        setError('Transcription timed out. Please try again.');
        setLoading(false);
        setTranscriptionStatus('failed');
        return;
      }

      pollCountRef.current += 1;
      const response = await fetch(`/api/transcribe/status/${jobId}`);
      const data = await response.json();
      console.log('Poll response:', data);

      // Map API status to TranscriptionStatus
      const statusMap: Record<string, typeof transcriptionStatus> = {
        'processing': 'processing',
        'accepted': 'accepted',
        'pending': 'pending',
        'completed': 'succeeded',
        'success': 'succeeded',
        'failed': 'failed'
      };
      setTranscriptionStatus(statusMap[data.status] || 'processing');

      // If we have video information, it means we have a valid response
      if (data.video_id && data.video_title) {
        console.log('Received valid transcript data');
        hasValidDataRef.current = true;
        setTranscript(data);
        setLoading(false);
        setTranscriptionStatus('succeeded');
        clearPolling();
        return;
      }

      // Handle failed status with "already exists" error
      if (data.status === 'failed' && data.error?.includes('already exists')) {
        console.log('Transcript already exists, fetching existing transcript');
        const videoId = data.error.match(/video_id (\w+)/)?.[1];
        if (!videoId) {
          throw new Error('Could not extract video ID from error message');
        }
        
        // Set hasValidDataRef before making the new request
        hasValidDataRef.current = true;
        clearPolling();
        
        // Make a new request to the transcribe endpoint
        const transcribeResponse = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ youtube_url: `https://www.youtube.com/watch?v=${videoId}` }),
        });

        if (!transcribeResponse.ok) {
          throw new Error(`Failed to fetch existing transcript: ${transcribeResponse.status}`);
        }
        
        const existingTranscript = await transcribeResponse.json();
        if (existingTranscript.error) {
          throw new Error(existingTranscript.error);
        }
        
        setTranscript(existingTranscript);
        setLoading(false);
        setTranscriptionStatus('succeeded');
        return;
      }

      // If still processing and we don't have valid data, continue polling
      if (!hasValidDataRef.current && ['processing', 'accepted', 'pending'].includes(data.status)) {
        console.log(`Status is ${data.status}, continuing to poll`);
        pollIntervalRef.current = setTimeout(() => pollTranscriptionStatus(jobId), 2000);
        return;
      }

      // If status is failed (without "already exists") or unexpected
      if (data.status === 'failed' || !['processing', 'accepted', 'pending', 'success'].includes(data.status)) {
        console.log(`Unexpected status: ${data.status}`);
        clearPolling();
        setLoading(false);
        setError(data.error || 'Transcription failed or was cancelled');
        setTranscriptionStatus('failed');
        return;
      }
      
    } catch (error) {
      console.error('Error polling status:', error);
      clearPolling();
      setError(error instanceof Error ? error.message : 'Failed to check transcription status');
      setLoading(false);
      setTranscriptionStatus('failed');
    }
  }, [clearPolling]);

  const fetchTranscript = useCallback(async (url: string) => {
    if (hasInitialRequestRef.current) {
      return;
    }
    hasInitialRequestRef.current = true;
    setTranscriptionStatus('accepted');

    try {
      console.log('Fetching transcript for URL:', url);
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: url }),
      });

      const data = await response.json();
      console.log('Initial transcribe response:', data);

      // If we have video information, show it immediately
      if (data.video_id && data.video_title) {
        console.log('Received valid transcript data directly');
        setTranscript(data);
        setLoading(false);
        setTranscriptionStatus('succeeded');
        return;
      }

      // Got a job_id, start polling
      if (data.job_id) {
        console.log('Received job_id, starting polling:', data.job_id);
        setTranscript({ status: 'processing' } as TranscriptResponse);
        setTranscriptionStatus('processing');
        pollTranscriptionStatus(data.job_id);
        return;
      }

      // Unexpected response
      console.error('Unexpected response:', data);
      throw new Error('Invalid response from transcription service');

    } catch (error) {
      console.error('Error fetching transcript:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch transcript');
      setLoading(false);
      setTranscriptionStatus('failed');
    }
  }, [pollTranscriptionStatus]);

  const resetState = useCallback(() => {
    clearPolling();
    hasInitialRequestRef.current = false;
    hasValidDataRef.current = false;
    setTranscript(null);
    setLoading(true);
    setError(null);
    setCharacterCounts({
      txt: 0,
      srt: 0,
      vtt: 0,
    });
  }, [clearPolling]);

  useEffect(() => {
    let isCurrentRequest = true;
    
    // Reset state when URL changes
    resetState();
    
    if (initialUrl) {
      // Only proceed if this is still the current request
      if (isCurrentRequest) {
        fetchTranscript(initialUrl);
      }
    }

    // Cleanup function
    return () => {
      isCurrentRequest = false;
    };
  }, [initialUrl, fetchTranscript, resetState]);

  useEffect(() => {
    if (transcript?.status === 'completed' || transcript?.status === 'success') {
      if (transcript.transcription?.segments) {
        setCharacterCounts({
          txt: transcript.transcription_raw?.length || 0,
          srt: formatToSRT(transcript.transcription.segments).length,
          vtt: formatToVTT(transcript.transcription.segments).length,
        })
      }
    }
  }, [transcript])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to Clipboard",
      description: "The transcript has been copied to your clipboard.",
    })
  }

  const downloadTranscript = (content: string, format: string) => {
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
  }

  if (loading || ['processing', 'accepted', 'pending'].includes(transcript?.status || '')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-8">
          <TranscriptionProgress 
            status={transcriptionStatus}
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">{transcript.video_title}</h1>
      
      <Tabs defaultValue="txt" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="txt">TXT</TabsTrigger>
          <TabsTrigger value="srt">SRT</TabsTrigger>
          <TabsTrigger value="vtt">VTT</TabsTrigger>
        </TabsList>

        {(['txt', 'srt', 'vtt'] as const).map((format) => {
          const content = format === 'txt' 
            ? transcript.transcription_raw || ''
            : format === 'srt'
            ? formatToSRT(transcript?.transcription?.segments || [])
            : formatToVTT(transcript?.transcription?.segments || [])

          return (
            <TabsContent key={format} value={format}>
              <Card>
                <CardContent className="p-4">
                  <div className="max-h-60 overflow-y-auto mb-4 custom-scrollbar">
                    <pre className="text-sm text-foreground whitespace-pre-wrap">
                      {content}
                    </pre>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {characterCounts[format].toLocaleString()} characters
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-foreground"
                        onClick={() => copyToClipboard(content)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-foreground"
                        onClick={() => downloadTranscript(content, format)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
} 