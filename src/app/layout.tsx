import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'ANAREKA-CI',
  description: 'Gestion des membres ANAREKA-CI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ANAREKA-CI',
  },
}

export const viewport: Viewport = {
  themeColor: '#2ecc71',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className="bg-anareka-ivoire min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  )
}