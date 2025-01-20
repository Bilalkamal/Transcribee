import Link from 'next/link'
import { AlertCircle, MessageSquare, Coffee } from 'lucide-react'

export function Footer() {
  return (
    <footer className="enhanced-footer">
      <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-center">
            <span>Made with 💙 by Bilal 🐝</span>
            <span> {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <Link 
              href="/privacy" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <div className="hidden sm:block text-muted-foreground">•</div>
            <a 
              href="mailto:bugs@transcrib.ee"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <AlertCircle className="h-4 w-4" />
              Report a Bug
            </a>
            <div className="hidden sm:block text-muted-foreground">•</div>
            <a 
              href="mailto:feedback@transcrib.ee"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              Send Feedback
            </a>
            <div className="block sm:hidden text-muted-foreground">•</div>
            <div className="block sm:hidden">
              <a
                href="https://ko-fi.com/bilalh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <Coffee className="h-4 w-4" />
                <span>Support us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 