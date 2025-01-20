import { Youtube, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Image from 'next/image'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">
              How Our Busy Bees Work Their Magic 🐝
            </h1>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Three Sweet Ways to Get Your Transcripts</h2>
              
              <div className="bg-[#FFF9E5] dark:bg-[#1E252C] rounded-lg p-6 mb-8 hover-lift">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-[#F2B705]">
                  <Youtube className="mr-2" />
                  1. Chrome Extension - The Fastest Way!
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Install our <Link href="https://chromewebstore.google.com/detail/transcribee-transcribe-yo/dcgbnpldgflkjmgmllfccokoinhhkhnl" className="text-primary hover:underline" target="_blank">Chrome Extension</Link></li>
                  <li>Navigate to any YouTube video</li>
                  <li>Choose your preferred method:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Click the Transcrib.ee button in the video player</li>
                      <li>Use Ctrl+E (Windows) or Cmd+E (Mac)</li>
                      <li>Click the extension icon</li>
                    </ul>
                  </li>
                  <li>Get instant, accurate transcriptions!</li>
                </ol>
              </div>

              <div className="bg-[#FFF9E5] dark:bg-[#1E252C] rounded-lg p-6 mb-8 hover-lift">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-[#F2B705]">
                  <Youtube className="mr-2" />
                  2. Visit Our Hive
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Buzz over to <Link href="/" className="text-primary hover:underline">transcrib.ee</Link></li>
                  <li>Drop your YouTube URL into our honeycomb</li>
                  <li>Let our worker bees start their magic</li>
                  <li>Watch as your transcript flows like honey!</li>
                </ol>
                {/* Add GIF here */}
                <div className="mt-4 rounded-lg overflow-hidden">
                  <Image
                    src="/gifs/homepage-demo.gif"
                    alt="Homepage transcription demo"
                    width={600}
                    height={338}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="bg-[#FFF9E5] dark:bg-[#1E252C] rounded-lg p-6 hover-lift">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-[#F2B705]">
                  <ExternalLink className="mr-2" />
                  3. Use Our Quick Pollination Method
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Grab any YouTube video URL</li>
                  <li>Sprinkle "transcrib.ee/" at the start</li>
                  <li>Let our bees do their work</li>
                  <li>Enjoy instant transcription nectar!</li>
                </ol>
                <p className="mt-4 text-sm text-muted-foreground">
                  Example: transcrib.ee/youtube.com/watch?v=pO5dgZrM9Mk
                </p>
                {/* Add GIF here */}
                <div className="mt-4 rounded-lg overflow-hidden">
                  <Image
                    src="/gifs/youtube-demo.gif"
                    alt="URL shortcut demo"
                    width={600}
                    height={338}
                    className="w-full"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Output Formats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                <div className="bg-[#FFF9E5] dark:bg-[#1E252C] p-4 md:p-6 rounded-lg hover-lift">
                  <h3 className="font-semibold mb-2">TXT</h3>
                  <p className="text-sm text-muted-foreground">
                    Pure, unfiltered text - perfect for reading or processing
                  </p>
                </div>
                <div className="bg-[#FFF9E5] dark:bg-[#1E252C] p-4 md:p-6 rounded-lg hover-lift">
                  <h3 className="font-semibold mb-2">SRT</h3>
                  <p className="text-sm text-muted-foreground">
                    Premium subtitle format for video editing
                  </p>
                </div>
                <div className="bg-[#FFF9E5] dark:bg-[#1E252C] p-4 md:p-6 rounded-lg hover-lift">
                  <h3 className="font-semibold mb-2">VTT</h3>
                  <p className="text-sm text-muted-foreground">
                    Web-optimized format for online players
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 