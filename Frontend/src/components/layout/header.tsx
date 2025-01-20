import { Logo } from '../ui/logo'
import { NavLink } from '../ui/nav-link'
import { ThemeToggle } from '../ui/theme-toggle'
import { ExtensionLink } from '../ui/extension-link'
import { MobileMenu } from '../ui/mobile-menu'
import { Coffee } from 'lucide-react'

export function Header() {
  return (
    <header className="enhanced-header">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/how-it-works">How it Works</NavLink>
            <NavLink href="/about">About</NavLink>
            <ExtensionLink />
            
          </nav>
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}