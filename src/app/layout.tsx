import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar, { NavbarEspace } from '@/components/Navbar'
import Splash from '@/components/Splash'

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
  themeColor: '#1a3d2b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className="bg-anareka-ivoire min-h-dvh">
        <Splash />
        <Navbar />
        {children}
        <NavbarEspace />
      </body>
    </html>
  )
}