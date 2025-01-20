import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: {
    jobId: Promise<string> | string;
  };
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Await the jobId parameter
    const jobId = await context.params.jobId;
    
    if (!jobId || typeof jobId !== 'string') {
      console.log('No job ID provided');
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    console.log('Checking status for job:', jobId);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.transcrib.ee';
    const statusUrl = new URL(`/transcribe/status/${jobId}`, apiUrl);
    console.log('Fetching status from:', statusUrl.toString());

    const response = await fetch(statusUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error checking transcription status:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check transcription status',
        status: 'failed',
      },
      { status: error instanceof Error && error.message.includes('timeout') ? 504 : 500 }
    );
  }
}