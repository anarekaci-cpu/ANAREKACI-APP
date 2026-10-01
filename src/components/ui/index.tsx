import Link from 'next/link'
import type { ReactNode } from 'react'
import Toast from '@/components/Toast'

/* Classes partagées (auparavant copiées-collées dans chaque page). */
export const labelCls = 'block text-sm font-semibold text-anareka-noir mb-1.5'
export const champCls =
  'w-full bg-white border-2 border-anareka-bordure rounded-anareka px-4 py-3 text-anareka-noir placeholder:text-anareka-gris/60 focus:outline-none focus:border-anareka-vert-clair focus:ring-4 focus:ring-anareka-vert-clair/15 transition'
export const boutonCls =
  'btn btn-shine bg-anareka-or text-anareka-noir px-6 py-3.5 text-base shadow-anareka-or hover:bg-anareka-or-clair disabled:opacity-50'
export const boutonPleinCls = `${boutonCls} w-full`
export const boutonSecondaireCls =
  'btn bg-white text-anareka-vert px-6 py-3.5 text-base border-2 border-anareka-vert/80 hover:bg-anareka-vert-pale'
export const boutonPetitCls = 'btn text-sm px-4 py-2 rounded-xl'

export function Flash({ erreur, succes }: { erreur?: string; succes?: string }) {
  if (!erreur && !succes) return null
  // `key` : un nouveau message réinitialise le minuteur du toast
  return <Toast key={erreur ?? succes} erreur={erreur} succes={succes} />
}

export function Carte({ children, accent = false, className = '' }: { children: ReactNode; accent?: boolean; className?: string }) {
  return (
    <div
      className={`bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5 sm:p-6 reveal ${
        accent ? 'border-l-4 border-l-anareka-or' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

/** En-tête des pages membres : grand titre sur papier, sous une fine bande de pagne qui défile. */
export function EnTete({ surtitre, titre, retour }: { surtitre?: string; titre: string; retour?: { href: string; label: string } }) {
  return (
    <header className="bg-anareka-ivoire">
      <div className="pagne-band pagne-band--anime" aria-hidden />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        {retour && (
          <Link href={retour.href} className="reveal inline-flex items-center gap-1 text-sm font-semibold text-anareka-vert mb-3 active:opacity-60" style={{ ['--i' as string]: 0 }}>
            <span aria-hidden>←</span> {retour.label}
          </Link>
        )}
        {surtitre && <p className="reveal text-sm font-bold text-anareka-terre" style={{ ['--i' as string]: 0 }}>{surtitre}</p>}
        <h1 className="reveal font-serif text-4xl sm:text-5xl font-extrabold text-anareka-noir leading-[1.02]" style={{ ['--i' as string]: 1 }}>{titre}</h1>
      </div>
    </header>
  )
}

/** En-tête sombre des pages d'administration. */
export function EnTeteAdmin({ titre, retour = { href: '/admin', label: 'Retour admin' } }: { titre: string; retour?: { href: string; label: string } }) {
  return (
    <header className="bg-anareka-noir text-white">
      <div className="pagne-band" aria-hidden />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <h1 className="font-serif text-xl font-bold">{titre}</h1>
        <Link href={retour.href} className="text-sm font-semibold text-anareka-or-clair hover:text-white whitespace-nowrap">
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
  return <span className={`inline-block text-xs font-bold rounded-full px-2.5 py-1 ${BADGES[ton]}`}>{children}</span>
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
