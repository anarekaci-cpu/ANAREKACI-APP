import Link from 'next/link'
import type { ReactNode } from 'react'
import Toast from '@/components/Toast'

/* Classes partagées (auparavant copiées-collées dans chaque page). */
export const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5'
export const champCls =
  'w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition'
export const boutonCls =
  'bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka px-6 py-2.5 hover:bg-anareka-vert-clair transition-colors shadow-anareka disabled:opacity-50 btn-shine'
export const boutonPleinCls = `${boutonCls} w-full`
export const boutonSecondaireCls =
  'bg-anareka-blanc text-anareka-vert font-semibold text-sm uppercase tracking-wide rounded-anareka px-6 py-2.5 border-2 border-anareka-vert hover:bg-anareka-vert-pale transition-colors'
export const boutonPetitCls = 'text-xs font-semibold uppercase tracking-wide rounded-anareka px-3 py-1.5 transition-colors'

export function Flash({ erreur, succes }: { erreur?: string; succes?: string }) {
  if (!erreur && !succes) return null
  // `key` : un nouveau message réinitialise le minuteur du toast
  return <Toast key={erreur ?? succes} erreur={erreur} succes={succes} />
}

export function Carte({ children, accent = false, className = '' }: { children: ReactNode; accent?: boolean; className?: string }) {
  return (
    <div
      className={`bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6 reveal ${
        accent ? 'border-t-4 border-t-anareka-or' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

/** En-tête vert des pages membres. */
export function EnTete({ surtitre, titre, retour }: { surtitre?: string; titre: string; retour?: { href: string; label: string } }) {
  return (
    <header className="hero-aurora border-b border-anareka-or/25">
      <div className="hero-pattern absolute inset-0 opacity-60" />
      <div className="relative max-w-3xl mx-auto px-6 py-8">
        {surtitre && <span className="reveal text-[10px] font-semibold uppercase tracking-[0.25em] text-anareka-or-clair" style={{ ['--i' as string]: 0 }}>{surtitre}</span>}
        <h1 className="reveal font-serif text-4xl font-bold text-white mt-1" style={{ ['--i' as string]: 1 }}>{titre}</h1>
        <div className="reveal w-14 h-0.5 bg-gradient-to-r from-anareka-or to-transparent mt-3" style={{ ['--i' as string]: 2 }} />
        {retour && (
          <Link href={retour.href} className="reveal inline-block mt-3 text-xs uppercase tracking-wide text-anareka-or-clair hover:text-white transition-colors" style={{ ['--i' as string]: 3 }}>
            ← {retour.label}
          </Link>
        )}
      </div>
    </header>
  )
}

/** En-tête sombre des pages d'administration. */
export function EnTeteAdmin({ titre, retour = { href: '/admin', label: 'Retour admin' } }: { titre: string; retour?: { href: string; label: string } }) {
  return (
    <header className="bg-anareka-noir text-white border-b-2 border-anareka-or">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <h1 className="font-serif text-xl font-bold">{titre}</h1>
        <Link href={retour.href} className="text-xs uppercase tracking-wide text-anareka-or-clair hover:text-anareka-or whitespace-nowrap">
          {retour.label}
        </Link>
      </div>
    </header>
  )
}

const BADGES = {
  vert: 'bg-anareka-vert-pale text-anareka-vert',
  or: 'bg-anareka-or-pale text-anareka-terre',
  rouge: 'bg-red-50 text-red-700',
  gris: 'bg-gray-100 text-anareka-gris',
} as const

export function Badge({ children, ton = 'gris' }: { children: ReactNode; ton?: keyof typeof BADGES }) {
  return <span className={`inline-block text-[11px] font-semibold uppercase tracking-wide rounded-full px-2.5 py-0.5 ${BADGES[ton]}`}>{children}</span>
}

export function Vide({ children }: { children: ReactNode }) {
  return <p className="text-sm text-anareka-gris text-center py-8">{children}</p>
}

export function dateFR(iso: string | null | undefined, avecHeure = false): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(avecHeure ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}
