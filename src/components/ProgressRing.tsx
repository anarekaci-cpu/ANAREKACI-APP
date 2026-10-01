import type { CSSProperties, ReactNode } from 'react'

/** Anneau de progression animé (SVG). `pourcent` de 0 à 100. */
export default function ProgressRing({ pourcent, taille = 120, epaisseur = 10, children, clair = false }: { pourcent: number; taille?: number; epaisseur?: number; children?: ReactNode; clair?: boolean }) {
  const r = (taille - epaisseur) / 2
  const circ = 2 * Math.PI * r
  const cible = circ * (1 - Math.max(0, Math.min(100, pourcent)) / 100)
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: taille, height: taille }}>
      <svg width={taille} height={taille} className="-rotate-90" aria-hidden>
        <circle cx={taille / 2} cy={taille / 2} r={r} fill="none" strokeWidth={epaisseur} stroke={clair ? 'rgba(255,255,255,.15)' : '#e4e2d2'} />
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={r}
          fill="none"
          strokeWidth={epaisseur}
          stroke="#efc94c"
          strokeLinecap="round"
          strokeDasharray={circ}
          className="ring-progress"
          style={{ ['--circ' as string]: circ, ['--target' as string]: cible, strokeDashoffset: cible } as CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}
