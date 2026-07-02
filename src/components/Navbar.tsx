'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const liens = [
  { href: '/dashboard', label: 'Accueil' },
  { href: '/formations', label: 'Formations' },
  { href: '/annonces', label: 'Annonces' },
  { href: '/documents', label: 'Documents' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOuvert, setMenuOuvert] = useState(false)

  // Pas de navbar sur login/register
  if (pathname === '/login' || pathname === '/register') return null

  return (
    <nav className="bg-green-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/dashboard" className="font-bold text-lg tracking-tight">
          ANAREKA<span className="text-yellow-300">-CI</span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center gap-1">
          {liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname.startsWith(l.href)
                  ? 'bg-white text-green-700'
                  : 'text-white/85 hover:bg-white/15'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <form action="/api/logout" method="POST" className="ml-2">
            <button className="text-sm text-white/75 border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/15 transition">
              Déconnexion
            </button>
          </form>
        </div>

        {/* Burger mobile */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/15"
          onClick={() => setMenuOuvert(!menuOuvert)}
        >
          <span className="block w-5 h-0.5 bg-white mb-1"></span>
          <span className="block w-5 h-0.5 bg-white mb-1"></span>
          <span className="block w-5 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* Menu mobile */}
      {menuOuvert && (
        <div className="md:hidden bg-green-800 px-4 pb-4 flex flex-col gap-1">
          {liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOuvert(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname.startsWith(l.href)
                  ? 'bg-white text-green-700'
                  : 'text-white/85 hover:bg-white/15'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <form action="/api/logout" method="POST">
            <button className="w-full text-left text-sm text-white/75 px-3 py-2 hover:bg-white/15 rounded-lg transition">
              Déconnexion
            </button>
          </form>
        </div>
      )}
    </nav>
  )
}