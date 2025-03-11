import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Tiny5 } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { Header } from './header'
import { ErrorHandler } from './utils/error-handler'

const tiny5 = Tiny5({
  subsets: ['latin'],
  weight: ['400'],
})

export const metadata: Metadata = {
  title: 'dotelier studio',
  description: 'pixel art atelier',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={tiny5.className} lang='en'>
      <body>
        <Header />
        {children}
        <Toaster />
        <Analytics />
        <ErrorHandler />
      </body>
    </html>
  )
}
