import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Tiny5 } from 'next/font/google'
import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { UserProfile } from './_components/user/profile'
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
      <body className='flex flex-col h-screen overflow-hidden'>
        <Header />
        <div className='flex-1 overflow-auto'>{children}</div>
        <Suspense fallback={null}>
          <div className='fixed bottom-0 right-0 z-40'>
            <UserProfile />
          </div>
        </Suspense>
        <Toaster />
        <Analytics />
        <ErrorHandler />
      </body>
    </html>
  )
}
