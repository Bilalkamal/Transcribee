'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Coffee } from 'lucide-react'
import Image from 'next/image'

export function SupportDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#FF5E5B] hover:bg-[#FF4542] rounded-full transition-all duration-200 hover:-translate-y-0.5">
          <Coffee className="h-4 w-4" />
          <span>Support</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Support Transcrib.ee</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <Image
            src="/images/kofi-qrcode.webp"
            alt="Ko-fi QR Code"
            width={200}
            height={200}
            className="rounded-lg"
          />
          <iframe
            id='kofiframe'
            src='https://ko-fi.com/bilalh/?hidefeed=true&widget=true&embed=true&preview=true'
            className="border-0 w-full h-[570px]"
            title="kofiframe"
            loading="lazy"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 