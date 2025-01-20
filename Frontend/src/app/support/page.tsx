import Image from 'next/image'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Support Transcrib.ee</h1>
          <div className="flex flex-col items-center gap-8">
            <Image
              src="/images/kofi-qrcode.webp"
              alt="Ko-fi QR Code"
              width={250}
              height={250}
              className="rounded-lg shadow-lg"
            />
            <iframe
              id='kofiframe'
              src='https://ko-fi.com/bilalh/?hidefeed=true&widget=true&embed=true&preview=true'
              className="border-0 w-full max-w-md h-[570px]"
              title="kofiframe"
              loading="lazy"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 