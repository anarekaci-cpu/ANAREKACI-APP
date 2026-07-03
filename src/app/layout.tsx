import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'ANAREKA-CI',
  description: 'Gestion des membres ANAREKA-CI',
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