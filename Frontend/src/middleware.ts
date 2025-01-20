import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of valid static routes
const validRoutes = [
  '/',
  '/about',
  '/privacy',
  '/how-it-works',
];

// Function to check if string might be a YouTube URL or video ID
function isYouTubeUrl(path: string) {
  // Remove leading slash
  const urlPath = path.slice(1);
  
  // Check for YouTube URL patterns
  const youtubePatterns = [
    /^(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/,
    /^[a-zA-Z0-9_-]{11}$/ // Just the video ID
  ];

  return youtubePatterns.some(pattern => pattern.test(urlPath));
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow static files and API routes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/static') ||
    path.includes('.') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // If it's a valid route, continue
  if (validRoutes.includes(path)) {
    return NextResponse.next();
  }

  // If it looks like a YouTube URL or video ID, let the app handle it
  if (isYouTubeUrl(path)) {
    return NextResponse.next();
  }

  // For all other routes, redirect to 404
  return NextResponse.redirect(new URL('/404', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 