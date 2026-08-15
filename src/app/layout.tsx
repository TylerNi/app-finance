import type { Metadata, Viewport } from 'next'
import { SwRegister } from '@/components/sw-register'
import './globals.css'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f2f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Finances',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Finances', statusBarStyle: 'default' },
  icons: { apple: '/icons/apple-touch-icon.png' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr-CA">
      <body>
        {children}
        <SwRegister />
      </body>
    </html>
  )
}
