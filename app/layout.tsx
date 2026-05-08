import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { TopHeader } from '@/components/layout/TopHeader'
import { BottomNav } from '@/components/layout/BottomNav'
import { POSProvider } from '@/context/POSContext'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'POS - Punto de Venta',
  description: 'Sistema de punto de venta para tienda minorista',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-AR" className="bg-muted">
      <body className="font-sans antialiased">
        <POSProvider>
          <div className="flex min-h-dvh flex-col bg-muted">
            <TopHeader />
            <main className="flex-1 pb-20">{children}</main>
            <BottomNav />
          </div>
        </POSProvider>
      </body>
    </html>
  )
}
