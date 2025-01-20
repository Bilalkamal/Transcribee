'use client';

import dynamic from 'next/dynamic'

const TranscriptView = dynamic(() => import('./TranscriptView'), { ssr: false })

export default function TranscriptViewWrapper({ initialUrl }: { initialUrl: string }) {
  return <TranscriptView initialUrl={initialUrl} />
} 