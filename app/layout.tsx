import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Football Predictions',
  description: 'Football prediction league app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b bg-gray-200 px-4 py-3">
          <div className="flex gap-6 text-sm font-semibold text-black">
            <Link href="/">Home</Link>
            <Link href="/fixtures">Fixtures</Link>
            <Link href="/predictions">Predictions</Link>
            <Link href="/standings">Standings</Link>
            <Link href="/admin/results">Admin Results</Link>
          </div>
        </nav>

        {children}
      </body>
    </html>
  )
}