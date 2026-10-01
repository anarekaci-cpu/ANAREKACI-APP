import type { SVGProps } from 'react'

/** Jeu d'icônes dessinées (trait 2 px, arrondies) : remplace les emojis, qui n'ont pas le même rendu d'un téléphone à l'autre. */
const D = {
  accueil: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  cotisations: 'M3 6h18v12H3zM3 10h18M7 15h3',
  messages: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  alertes: 'M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.3 21a1.9 1.9 0 0 0 3.4 0',
  formations: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6',
  annonces: 'M3 11v3a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11',
  evenements: 'M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  paiements: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
  carte: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM2 10h20M6 15h4',
  profil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  admin: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 .5a7 7 0 0 0-1.5-1L15 4h-4l-.5 2.5a7 7 0 0 0-1.5 1L7 7l-2 4 2 1a7 7 0 0 0 0 2l-2 1 2 4 2-.5a7 7 0 0 0 1.5 1L11 20h4l.5-2.5a7 7 0 0 0 1.5-1l2 .5 2-4-2-1a7 7 0 0 0 0-2z',
  plus: 'M4 7h16M4 12h16M4 17h10',
  fleche: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  logout: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9',
  tisser: 'M4 4h16v16H4zM4 12h16M12 4v16',
} as const

export type NomIcone = keyof typeof D

export default function Icone({ nom, taille = 24, trait = 2, ...p }: { nom: NomIcone; taille?: number; trait?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={trait} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
      <path d={D[nom]} />
    </svg>
  )
}
