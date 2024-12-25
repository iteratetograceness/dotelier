import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { Tiny5 } from 'next/font/google'
import './globals.css'
import { Header } from './header'

const tiny5 = Tiny5({
  subsets: ['latin'],
  weight: ['400'],
})

export const metadata: Metadata = {
  title: 'dotelier',
  description: 'pixel art studio',
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
      </body>
    </html>
  )
}
