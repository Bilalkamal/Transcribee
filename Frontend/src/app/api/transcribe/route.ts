import { NextResponse } from 'next/server'

function validateAndFormatYoutubeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Extract video ID
    let videoId = null
    if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v')
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.substring(1)
    }

    if (!videoId) {
      throw new Error('Could not extract video ID from URL')
    }

    // Return canonical format
    return `https://www.youtube.com/watch?v=${videoId}`
  } catch (error) {
    console.error('URL validation error:', error)
    throw new Error('Invalid YouTube URL format')
  }
}

export async function POST(request: Request) {
  try {
    const { youtube_url } = await request.json()

    if (!youtube_url) {
      return NextResponse.json({ 
        error: 'YouTube URL not provided',
        status: 'failed' 
      }, { status: 400 })
    }

    const formattedUrl = validateAndFormatYoutubeUrl(youtube_url)
    const backendApiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.transcrib.ee'}/transcribe/`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch(backendApiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        },
        body: JSON.stringify({ youtube_url: formattedUrl }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.detail || `HTTP error! status: ${response.status}`)
      }

      return NextResponse.json(data)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({ 
          error: 'Request timed out while connecting to transcription service',
          status: 'failed'
        }, { status: 504 })
      }
      throw error
    }
  } catch (error) {
    console.error('Error in API route /api/transcribe:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to connect to transcription service',
      status: 'failed'
    }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
