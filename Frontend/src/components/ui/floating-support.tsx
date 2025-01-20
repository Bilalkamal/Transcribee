'use client'

import { useState } from 'react'
import { X, Coffee } from 'lucide-react'

export function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop floating button */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        {isOpen ? (
          <div className="relative bg-background rounded-lg shadow-lg border">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-2 -right-2 p-1 bg-background rounded-full border shadow-sm hover:bg-muted transition-colors"
              aria-label="Close support widget"
            >
              <X className="h-4 w-4" />
            </button>
            <iframe
              id='kofiframe'
              src='https://ko-fi.com/bilalh/?hidefeed=true&widget=true&embed=true&preview=true'
              className="w-[330px] h-[570px] rounded-lg"
              title="kofiframe"
              loading="lazy"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 bg-[#FF5E5B] hover:bg-[#FF4542] text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 -translate-y-12 -translate-x-20"
            aria-label="Open support widget"
          >
            <Coffee className="h-7 w-7" />
            <span className="font-medium">Support us</span>
          </button>
        )}
      </div>

    </>
  )
} 