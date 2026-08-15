import type { Metadata, Viewport } from 'next'
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
  appleWebApp: { capable: true, title: 'Finances', statusBarStyle: 'default' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr-CA">
      <body>{children}</body>
    </html>
  )
}
