import { Lightbulb, Zap, Youtube, FastForward, FileText } from 'lucide-react'
import Link from 'next/link'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">
              About Transcrib.ee
            </h1>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Lightbulb className="mr-2 text-[#F2B705]" />
                Our Story
              </h2>
              <div className="bg-[#FFF9E5] dark:bg-[#1E252C] rounded-lg p-6 mb-6 hover-lift">
                <p className="mb-4 italic">
                  "Necessity is the mother of invention, but in this case, it was my mother who inspired the necessity."
                </p>
                <p className="text-sm text-muted-foreground">- Bilal, Founder of Transcrib.ee</p>
              </div>
              <p className="mb-4">
                Transcrib.ee was born from a real-world problem that I faced alongside my mom. We often found ourselves 
                attending lectures and educational content on YouTube, only to discover that many videos lacked transcriptions. 
                This made it challenging to review the material, take notes, or quickly find specific information.
              </p>
              <p className="mb-4">
                Frustrated by the lack of a fast and easy way to transcribe these videos, I decided to take matters into 
                my own hands. Like a bee determined to find nectar, I set out to create a solution that would not only help 
                us but also benefit countless others facing the same issue.
              </p>
              <p className="mb-4">
                The goal was clear: create a tool that could transcribe YouTube videos quickly and accurately, regardless 
                of the language. This led me to explore cutting-edge AI technologies, ultimately finding the perfect solution 
                in Groq and OpenAI's Whisper model. These powerful tools allowed Transcrib.ee to handle multiple languages 
                with impressive speed and accuracy.
              </p>
              
              <div className="flex items-center justify-center gap-4 my-8">
                <div className="flex flex-col items-center">
                  <Youtube className="w-12 h-12 text-[#F2B705] mb-2" />
                  <p className="text-sm text-center">Multilingual<br />Videos</p>
                </div>
                <FastForward className="w-8 h-8 text-[#F2A30F]" />
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 mb-2">
                    <img
                      src="/images/logo.jpg"
                      alt="Transcrib.ee Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-sm text-center">Transcrib.ee<br />AI Magic</p>
                </div>
                <FastForward className="w-8 h-8 text-[#F2A30F]" />
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-[#F2B705] mb-2" />
                  <p className="text-sm text-center">Accurate<br />Transcripts</p>
                </div>
              </div>

              <p className="mb-4">
                Today, Transcrib.ee stands as a testament to the power of solving personal problems for the greater good. 
                We've created a buzz in the world of transcription, offering a simple yet powerful tool that turns the 
                challenge of untranscribed videos into an opportunity for learning and accessibility.
              </p>
              <p>
                Now, my mom and I, you, and all users around the world, can easily transcribe YouTube videos in any language 
                quickly and accurately. 
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Zap className="mr-2 text-[#F2B705]" />
                What Sets Us Apart
              </h2>
              <div className="bg-[#FFF9E5] dark:bg-[#1E252C] rounded-lg p-6 hover-lift">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Lightning-fast transcriptions powered by Groq and OpenAI's Whisper model
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Accurate transcription across multiple languages
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    User-friendly interface that anyone can navigate with ease
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Unique URL shortcut feature for instant transcription access
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Multiple output formats (TXT, SRT, VTT) to suit various needs
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 