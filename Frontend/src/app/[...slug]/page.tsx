'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import HomePage from '../page';

export default function SlugPage() {
  const [isClient, setIsClient] = useState(false);
  const params = useParams();
  const slugParams = params?.slug as string[] || [];
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const parseYouTubeUrl = (slugParts: string[], searchParams: string) => {
    const baseUrl = slugParts.join('/');
    const fullUrl = searchParams ? `${baseUrl}${searchParams}` : baseUrl;

    // Try to extract video ID using different patterns
    let videoId: string | null = null;
    // Pattern for youtu.be URLs
    const shortUrlPattern = /youtu\.be\/([a-zA-Z0-9_-]{11})/i;
    const shortUrlMatch = fullUrl.match(shortUrlPattern);
    
    // Pattern for youtube.com URLs
    const longUrlPattern = /[?&]v=([a-zA-Z0-9_-]{11})/i;
    const longUrlMatch = fullUrl.match(longUrlPattern);

    if (shortUrlMatch) {
      videoId = shortUrlMatch[1];
    } else if (longUrlMatch) {
      videoId = longUrlMatch[1];
    }

    if (!videoId) {
      throw new Error('No video ID found in URL');
    }

    // Reconstruct the canonical YouTube URL
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

  // Only render the content on the client side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  try {
    const searchParams = window.location.search;
    const youtubeUrl = parseYouTubeUrl(slugParams, searchParams);
    
    return <HomePage initialUrl={youtubeUrl} skipHero />;
  } catch (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/30">
          <p>{(error as Error).message}</p>
          <p>Please ensure you&apos;re using a valid YouTube URL format.</p>
        </div>
      </div>
    );
  }
}