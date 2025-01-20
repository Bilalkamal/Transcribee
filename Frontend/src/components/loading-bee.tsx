import { BeeAnimation } from '@/components/ui/bee-animation'

export function LoadingBee({ state }: { state: 'processing' | 'success' | 'failed' }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <BeeAnimation state={state} />
      </div>
      <p className="text-muted-foreground">
        {state === 'processing' && 'Buzzing through your video...'}
        {state === 'success' && 'Sweet success! Transcript ready.'}
        {state === 'failed' && 'Oops! Something went wrong.'}
      </p>
    </div>
  )
} 