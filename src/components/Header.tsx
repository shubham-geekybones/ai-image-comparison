import Link from 'next/link'
import { Cpu } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gray-900 text-white">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Cpu size={24} />
          <span className="text-xl font-bold">AI Image Comparison</span>
        </Link>
      
      </div>
    </header>
  )
}
