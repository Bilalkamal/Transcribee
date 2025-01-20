'use client'

import { Download } from 'lucide-react'

export function ExtensionLink() {
  return (
    <a
      href="https://chromewebstore.google.com/detail/transcribee-transcribe-yo/dcgbnpldgflkjmgmllfccokoinhhkhnl"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full md:w-auto items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full transition-colors"
    >
      <Download className="h-4 w-4" />
      <span>Get Extension</span>
    </a>
  )
}
