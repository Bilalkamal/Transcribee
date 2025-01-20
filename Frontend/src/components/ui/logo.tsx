import Link from 'next/link'
import Image from 'next/image'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative w-8 h-8 rounded-lg overflow-hidden">
        <Image
          src="/images/logo.jpg"
          alt="Transcrib.ee Logo"
          width={32}
          height={32}
          className="object-cover"
          priority
        />
      </div>
      <h1 className="text-xl font-bold">Transcrib.ee</h1>
    </Link>
  )
} 