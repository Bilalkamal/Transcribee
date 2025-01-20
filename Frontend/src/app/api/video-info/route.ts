import { NextRequest, NextResponse } from 'next/server';

function formatSeconds(seconds: number): string {
  if (isNaN(seconds)) return 'N/A';
  return seconds.toString();
}

export async function GET(request: NextRequest) {
  try {
    const videoId = request.nextUrl.searchParams.get('videoId');
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Use YouTube's oEmbed endpoint to get video info
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    const data = await response.json();

    // Try to get duration from the video page
    const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageResponse = await fetch(videoPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    const html = await pageResponse.text();
    
    // Extract duration from meta tags
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : null;

    return NextResponse.json({
      title: data.title,
      duration: duration ? formatSeconds(duration) : 'N/A',
      author: data.author_name
    });
  } catch (error) {
    console.error('Error getting video info:', error);
    return NextResponse.json(
      { error: 'Failed to get video info' },
      { status: 500 }
    );
  }
} 