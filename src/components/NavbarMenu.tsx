'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/app/auth/actions'
import Logo from './Logo'

export type LienNav = { href: string; label: string; icone: string; compteur?: number; onglet?: boolean; pasSurBureau?: boolean }

function Pastille({ n }: { n?: number }) {
  if (!n) return null
  return (
    <span className="bg-anareka-or text-anareka-noir text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center leading-none">
      {n > 9 ? '9+' : n}
    </span>
  )
}

export default function NavbarMenu({ liens, nom }: { liens: LienNav[]; nom: string }) {
  const pathname = usePathname()
  const [plus, setPlus] = useState(false)
  const actif = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const onglets = liens.filter((l) => l.onglet)
  const autres = liens.filter((l) => !l.onglet)
  const plusActif = autres.some((l) => actif(l.href)) || actif('/profil')
  const alertes = liens.find((l) => l.href === '/notifications')

  return (
    <>
      {/* ───── Barre du haut (mobile : fine ; bureau : navigation complète) ───── */}
      <header className="sticky top-0 z-50 bg-anareka-vert text-white border-b border-anareka-or/40 shadow-anareka pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 h-14 xl:h-16 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <Logo taille={40} priority />
            <span className="min-w-0 leading-tight">
              <span className="block font-serif text-lg font-bold">ANAREKA<span className="text-anareka-or-clair">-CI</span></span>
              <span className="block text-[11px] text-white/70 truncate max-w-[45vw] xl:max-w-48">{nom}</span>
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Navigation principale">
            {liens.filter((l) => !l.pasSurBureau).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={actif(l.href) ? 'page' : undefined}
                className={`flex items-center gap-1.5 rounded-anareka px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${actif(l.href) ? 'bg-white/15 text-anareka-or-clair' : 'text-white/85 hover:bg-white/10'}`}
              >
                <span>{l.icone}</span>
                {l.label}
                <Pastille n={l.compteur} />
              </Link>
            ))}
            <Link href="/profil" className={`rounded-anareka px-3 py-2 text-xs font-semibold uppercase tracking-wide ${actif('/profil') ? 'bg-white/15 text-anareka-or-clair' : 'text-white/85 hover:bg-white/10'}`}>👤 Profil</Link>
            <form action={logout} className="ml-2">
              <button className="text-xs font-semibold uppercase tracking-wide border border-anareka-or/60 text-anareka-or-clair px-3 py-2 rounded-anareka hover:bg-anareka-or hover:text-anareka-noir transition-colors">Déconnexion</button>
            </form>
          </nav>

          {/* Cloche rapide sur mobile */}
          {alertes && (
            <Link href="/notifications" className="xl:hidden relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 active:bg-white/20" aria-label="Alertes">
              <span className="text-xl">🔔</span>
              {!!alertes.compteur && <span className="absolute top-1 right-1"><Pastille n={alertes.compteur} /></span>}
            </Link>
          )}
        </div>
      </header>

      {/* ───── Barre d'onglets du bas (mobile) ───── */}
      <nav
        className="xl:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-anareka-bordure shadow-[0_-6px_24px_rgba(26,61,43,.12)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Navigation principale"
      >
        <ul className="grid grid-cols-5 max-w-lg mx-auto">
          {onglets.filter((l) => l.href !== '/notifications').map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setPlus(false)} aria-current={actif(l.href) ? 'page' : undefined} className="relative flex flex-col items-center justify-center gap-0.5 h-16 active:scale-95 transition-transform">
                <span className={`text-[22px] leading-none transition-transform ${actif(l.href) ? 'scale-110' : 'grayscale opacity-60'}`}>{l.icone}</span>
                <span className={`text-[10px] font-semibold ${actif(l.href) ? 'text-anareka-vert' : 'text-anareka-gris'}`}>{l.label}</span>
                {actif(l.href) && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-anareka-or" />}
                {!!l.compteur && <span className="absolute top-1.5 left-1/2 ml-2"><Pastille n={l.compteur} /></span>}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/formations" onClick={() => setPlus(false)} className="relative flex flex-col items-center justify-center gap-0.5 h-16 active:scale-95 transition-transform">
              <span className={`text-[22px] leading-none ${actif('/formations') ? 'scale-110' : 'grayscale opacity-60'}`}>📚</span>
              <span className={`text-[10px] font-semibold ${actif('/formations') ? 'text-anareka-vert' : 'text-anareka-gris'}`}>Formations</span>
              {actif('/formations') && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-anareka-or" />}
            </Link>
          </li>
          <li>
            <button type="button" onClick={() => setPlus(true)} aria-expanded={plus} className="relative flex w-full flex-col items-center justify-center gap-0.5 h-16 active:scale-95 transition-transform">
              <span className={`text-[22px] leading-none ${plusActif ? 'scale-110' : 'grayscale opacity-60'}`}>☰</span>
              <span className={`text-[10px] font-semibold ${plusActif ? 'text-anareka-vert' : 'text-anareka-gris'}`}>Plus</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* ───── Feuille « Plus » ───── */}
      {plus && (
        <div className="xl:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Plus">
          <button type="button" aria-label="Fermer" onClick={() => setPlus(false)} className="absolute inset-0 bg-anareka-noir/60 backdrop-blur-sm animate-fade-in" />
          <div className="sheet absolute bottom-0 inset-x-0 rounded-t-3xl bg-anareka-ivoire shadow-2xl px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-h-[85dvh] overflow-y-auto">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-anareka-gris/30" />
            <p className="text-xs text-anareka-gris px-1 mb-3">Connecté : <strong className="text-anareka-vert">{nom}</strong></p>
            <ul className="grid grid-cols-3 gap-3">
              {[...autres.filter((l) => l.href !== '/formations'), { href: '/profil', label: 'Profil', icone: '👤' }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setPlus(false)} className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border bg-white h-24 text-center active:scale-95 transition-transform ${actif(l.href) ? 'border-anareka-or' : 'border-anareka-bordure'}`}>
                    <span className="text-3xl leading-none">{l.icone}</span>
                    <span className="text-[11px] font-semibold text-anareka-vert leading-tight px-1">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <form action={logout} className="mt-4">
              <button className="w-full h-12 rounded-2xl border border-anareka-or/60 text-anareka-terre font-semibold text-sm uppercase tracking-wide active:bg-anareka-or-pale">Se déconnecter</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
