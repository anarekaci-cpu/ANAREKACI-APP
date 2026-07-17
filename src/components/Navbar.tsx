'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/app/auth/actions'

const sections = [
  { href: '/dashboard', label: 'Tableau de bord', icone: '🏠' },
  { href: '/cotisations', label: 'Cotisations', icone: '💰' },
  { href: '/formations', label: 'Formations', icone: '📚' },
  { href: '/messages', label: 'Messages', icone: '✉️' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOuvert, setMenuOuvert] = useState(false)

  if (pathname === '/login' || pathname === '/register') return null

  const lienActif = (href: string) => pathname.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 bg-anareka-ivoire/95 backdrop-blur-md border-b border-anareka-or/25 shadow-anareka">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="ANAREKA-CI"
            width={44}
            height={44}
            className="rounded-full border-2 border-anareka-or block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            priority
          />
          <span className="font-serif text-lg font-semibold leading-tight text-anareka-vert">
            ANAREKA<span className="text-anareka-or">-CI</span>
            <small className="block text-[10px] font-sans font-normal text-anareka-gris tracking-wide">
              Attiéké de Côte d&apos;Ivoire
            </small>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors duration-200 rounded-anareka ${lienActif(section.href) ? 'bg-anareka-vert-pale text-anareka-vert' : 'text-anareka-noir hover:bg-anareka-vert-pale hover:text-anareka-vert'}`}
            >
              <span className="text-lg">{section.icone}</span>
              <span>{section.label}</span>
            </Link>
          ))}
          <form action={logout} className="ml-3">
            <button className="text-xs font-semibold uppercase tracking-wide text-anareka-terre border border-anareka-or/50 px-3 py-2 rounded-anareka hover:bg-anareka-or hover:text-anareka-noir hover:border-anareka-or transition-colors duration-200">
              Déconnexion
            </button>
          </form>
        </div>

        <button
          className="md:hidden p-2 rounded-anareka hover:bg-anareka-vert-pale transition-colors"
          onClick={() => setMenuOuvert(!menuOuvert)}
          aria-label="Menu"
          aria-expanded={menuOuvert}
        >
          <span className={`block w-5 h-0.5 bg-anareka-vert mb-1 transition-transform duration-300 ${menuOuvert ? 'translate-y-1.5 rotate-45' : ''}`} />
          <span className={`block w-5 h-0.5 bg-anareka-vert mb-1 transition-opacity duration-300 ${menuOuvert ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-anareka-vert transition-transform duration-300 ${menuOuvert ? '-translate-y-1.5 -rotate-45' : ''}`} />
        </button>
      </div>

      {menuOuvert && (
        <div className="md:hidden bg-anareka-ivoire border-t border-anareka-or/20 px-4 pb-4 pt-4 flex flex-col gap-2 animate-fade-up">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              onClick={() => setMenuOuvert(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-anareka text-base font-semibold uppercase tracking-wide transition-colors duration-200 ${lienActif(section.href) ? 'bg-anareka-vert-pale text-anareka-vert' : 'text-anareka-noir hover:bg-anareka-vert-pale hover:text-anareka-vert'}`}
            >
              <span className="text-2xl">{section.icone}</span>
              <span>{section.label}</span>
            </Link>
          ))}
          <form action={logout} className="mt-2">
            <button className="w-full text-left px-4 py-4 rounded-anareka text-sm font-semibold uppercase tracking-wide text-anareka-terre hover:bg-anareka-vert-pale transition-colors duration-200">
              Déconnexion
            </button>
          </form>
        </div>
      )}
    </nav>
  )
}