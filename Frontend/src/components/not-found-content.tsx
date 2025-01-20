'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-6">
        <AlertCircle className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <div className="space-y-4 max-w-[600px]">
        <p className="text-xl text-muted-foreground">
          Oops! This page seems to have buzzed away.
        </p>
        <div className="bg-muted/50 p-4 rounded-lg text-muted-foreground">
          <p className="font-medium mb-2">Looking to transcribe a YouTube video?</p>
          <p>
            Use one of these formats:
          </p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li>transcrib.ee/VIDEO_ID</li>
            <li>transcrib.ee/youtube.com/watch?v=VIDEO_ID</li>
            <li>transcrib.ee/youtu.be/VIDEO_ID</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button asChild variant="default">
          <Link href="/how-it-works">
            Learn How it Works
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            Return to Homepage
          </Link>
        </Button>
      </div>
    </div>
  );
} 