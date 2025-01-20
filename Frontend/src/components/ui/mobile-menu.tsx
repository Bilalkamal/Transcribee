'use client'

import { Menu, X, Coffee } from 'lucide-react'
import { useState, useEffect } from 'react'
import { NavLink } from './nav-link'
import { ExtensionLink } from './extension-link'
import { cn } from '@/lib/utils'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [])

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      <div
        className={cn(
          "fixed inset-x-0 top-[64px] bg-background border-b border-border transition-all duration-200 ease-in-out transform",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="container px-4 py-4 flex flex-col gap-4">
          <NavLink href="/how-it-works">How it Works</NavLink>
          <NavLink href="/about">About</NavLink>
          <div className="py-2">
            <ExtensionLink />
          </div>
          <a
            href="https://ko-fi.com/bilalh"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#FF5E5B] hover:bg-[#FF4542] rounded-full transition-all duration-200"
          >
            <Coffee className="h-4 w-4" />
            <span>Support</span>
          </a>
        </div>
      </div>
    </div>
  )
}
