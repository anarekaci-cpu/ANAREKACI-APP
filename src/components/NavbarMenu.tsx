'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/app/auth/actions'
import Icone, { type NomIcone } from './Icones'
import Logo from './Logo'

export type LienNav = { href: string; label: string; icone: NomIcone; compteur?: number; onglet?: boolean; pasSurBureau?: boolean }

function Pastille({ n }: { n?: number }) {
  if (!n) return null
  return (
    <span className="bg-anareka-or text-anareka-noir text-[11px] font-extrabold rounded-full min-w-[19px] h-[19px] px-1 inline-flex items-center justify-center leading-none ring-2 ring-white">
      {n > 9 ? '9+' : n}
    </span>
  )
}

function vibrer() {
  try {
    navigator.vibrate?.(8)
  } catch {
    /* ignore */
  }
}

export default function NavbarMenu({ liens, nom }: { liens: LienNav[]; nom: string }) {
  const pathname = usePathname()
  const [plus, setPlus] = useState(false)
  const actif = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const onglets = liens.filter((l) => l.onglet)
  const autres = liens.filter((l) => !l.onglet)
  const alertes = liens.find((l) => l.href === '/notifications')
  const idxActif = onglets.findIndex((l) => actif(l.href))
  const plusActif = idxActif === -1 && (autres.some((l) => actif(l.href)) || actif('/profil'))
  const position = idxActif !== -1 ? idxActif : plusActif ? onglets.length : -1
  const total = onglets.length + 1

  return (
    <>
      {/* ───── Barre du haut ───── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-anareka-bordure pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0 active:opacity-70">
            <Logo taille={42} priority />
            <span className="min-w-0 leading-tight">
              <span className="block font-serif text-lg font-extrabold">ANAREKA<span className="text-anareka-vert-clair">-CI</span></span>
              <span className="block text-xs text-anareka-gris truncate max-w-[46vw] xl:max-w-56">{nom}</span>
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-1" aria-label="Navigation principale">
            {liens.filter((l) => !l.pasSurBureau).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={actif(l.href) ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${actif(l.href) ? 'bg-anareka-vert-pale text-anareka-vert' : 'text-anareka-gris hover:bg-anareka-gris-clair hover:text-anareka-noir'}`}
              >
                <Icone nom={l.icone} taille={18} />
                {l.label}
                <Pastille n={l.compteur} />
              </Link>
            ))}
            <Link href="/profil" className={`rounded-xl px-3 py-2 text-sm font-semibold ${actif('/profil') ? 'bg-anareka-vert-pale text-anareka-vert' : 'text-anareka-gris hover:bg-anareka-gris-clair'}`}>Profil</Link>
            <form action={logout} className="ml-2">
              <button className="text-sm font-semibold border-2 border-anareka-bordure text-anareka-noir px-3 py-1.5 rounded-xl hover:border-anareka-or transition-colors">Déconnexion</button>
            </form>
          </nav>

          {alertes && (
            <Link href="/notifications" onClick={vibrer} className="xl:hidden relative flex h-11 w-11 items-center justify-center rounded-full bg-anareka-gris-clair text-anareka-noir active:scale-90 transition-transform" aria-label={`Alertes${alertes.compteur ? ` (${alertes.compteur} non lues)` : ''}`}>
              <Icone nom="alertes" taille={22} />
              {!!alertes.compteur && <span className="absolute -top-0.5 -right-0.5"><Pastille n={alertes.compteur} /></span>}
            </Link>
          )}
        </div>
        <div className="pagne-band" aria-hidden />
      </header>

      {/* ───── Barre d'onglets flottante (mobile) ───── */}
      <nav className="xl:hidden fixed bottom-0 inset-x-0 z-50 px-3 pb-[calc(.6rem+env(safe-area-inset-bottom))] pointer-events-none" aria-label="Navigation principale">
        <div className="pointer-events-auto relative max-w-md mx-auto rounded-[26px] bg-anareka-noir/95 backdrop-blur-xl shadow-[0_18px_40px_-10px_rgba(12,42,29,.65)] ring-1 ring-white/10 p-1.5">
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-1.5 rounded-[20px] bg-anareka-or transition-[transform,opacity] duration-500 ease-[cubic-bezier(.34,1.4,.5,1)]"
            style={{ width: `calc((100% - .75rem) / ${total})`, transform: `translateX(${Math.max(position, 0) * 100}%)`, opacity: position === -1 ? 0 : 1 }}
          />
          <ul className="relative grid" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
            {onglets.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => { setPlus(false); vibrer() }} aria-current={actif(l.href) ? 'page' : undefined} className={`relative flex flex-col items-center justify-center gap-0.5 h-14 rounded-[20px] active:scale-90 transition-[transform,color] duration-200 ${actif(l.href) ? 'text-anareka-noir' : 'text-white/75'}`}>
                  <Icone nom={l.icone} taille={22} />
                  <span className="text-[11px] font-bold leading-none">{l.label}</span>
                  {!!l.compteur && <span className="absolute top-1 left-1/2 ml-1.5"><Pastille n={l.compteur} /></span>}
                </Link>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => { setPlus(true); vibrer() }} aria-expanded={plus} className={`relative flex w-full flex-col items-center justify-center gap-0.5 h-14 rounded-[20px] active:scale-90 transition-[transform,color] duration-200 ${plusActif ? 'text-anareka-noir' : 'text-white/75'}`}>
                <Icone nom="plus" taille={22} />
                <span className="text-[11px] font-bold leading-none">Plus</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* ───── Feuille « Plus » ───── */}
      {plus && (
        <div className="xl:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Plus d'options">
          <button type="button" aria-label="Fermer" onClick={() => setPlus(false)} className="absolute inset-0 bg-anareka-noir/60 backdrop-blur-sm animate-fade-in" />
          <div className="sheet absolute bottom-0 inset-x-0 rounded-t-[32px] bg-anareka-ivoire px-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-h-[88dvh] overflow-y-auto">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-anareka-gris/30" />
            <p className="px-1 mb-4 font-serif text-2xl font-extrabold">Plus</p>
            <ul className="grid grid-cols-3 gap-3">
              {[...autres, { href: '/profil', label: 'Profil', icone: 'profil' as NomIcone }].map((l, i) => (
                <li key={l.href} className="reveal" style={{ ['--i' as string]: i }}>
                  <Link href={l.href} onClick={() => setPlus(false)} className={`flex flex-col items-center justify-center gap-2 rounded-3xl border-2 bg-white h-[104px] text-center active:scale-95 transition-transform ${actif(l.href) ? 'border-anareka-or' : 'border-anareka-bordure'}`}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-anareka-vert-pale text-anareka-vert"><Icone nom={l.icone} taille={22} /></span>
                    <span className="text-xs font-bold px-1 leading-tight">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <form action={logout} className="mt-5">
              <button className="btn w-full h-13 py-3.5 border-2 border-anareka-bordure bg-white text-anareka-noir gap-2"><Icone nom="logout" taille={20} /> Se déconnecter</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
