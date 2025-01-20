import { Suspense } from "react";
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import { Analytics } from "@vercel/analytics/react"
import { FloatingSupport } from "@/components/ui/floating-support"

export const metadata: Metadata = {
  title: "Transcrib.ee - AI Precision, Sweet as Honey",
  description: "From Hive to Text, Transcribing at Its Best",
  icons: {
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicons/apple-touch-icon.png' },
    ],
    other: [
      { url: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Suspense>
          <GoogleAnalytics />
        </Suspense>
      </head>
      <body 
        className={`${GeistSans.className} min-h-screen bg-background antialiased`}
        suppressHydrationWarning
        data-new-gr-c-s-check-loaded
        data-gr-ext-installed
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <FloatingSupport />
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
