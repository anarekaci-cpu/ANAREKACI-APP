/** Vapeur d'attiéké : des grains qui s'élèvent doucement. Décoratif, déterministe (pas d'aléatoire → pas de décalage d'hydratation). */
const GRAINS = Array.from({ length: 26 }, (_, i) => ({
  x: `${(i * 37 + 7) % 100}%`,
  s: `${4 + ((i * 5) % 9)}px`,
  d: `${5 + ((i * 7) % 6)}s`,
  t: `${-((i * 13) % 9)}s`,
  dx: `${((i * 11) % 60) - 30}px`,
  b: i % 4 === 0 ? '2px' : '0px',
  c: i % 5 === 0 ? 'var(--color-anareka-or-clair)' : '#fffbe8',
}))

export default function Vapeur({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {GRAINS.map((g, i) => (
        <span key={i} className="grain" style={{ ['--x' as string]: g.x, ['--s' as string]: g.s, ['--d' as string]: g.d, ['--t' as string]: g.t, ['--dx' as string]: g.dx, ['--b' as string]: g.b, ['--c' as string]: g.c }} />
      ))}
    </div>
  )
}
