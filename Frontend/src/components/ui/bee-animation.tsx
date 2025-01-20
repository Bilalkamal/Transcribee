import { Loader2 } from 'lucide-react'

interface BeeAnimationProps {
  state: 'processing' | 'success' | 'failed'
}

export function BeeAnimation({ state }: BeeAnimationProps) {
  return (
    <div className="w-12 h-12 relative">
      {state === 'processing' && (
        <div className="animate-bounce">
          <span className="text-3xl">🐝</span>
        </div>
      )}
      {state === 'success' && <span className="text-3xl">🍯</span>}
      {state === 'failed' && <span className="text-3xl">😢</span>}
    </div>
  )
} 