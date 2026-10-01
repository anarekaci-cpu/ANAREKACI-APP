import Image from 'next/image'

/**
 * Logo sur pastille BLANCHE : le logo (fond vert foncé, texte fin) se perdait sur les
 * fonds sombres. Le disque blanc + liseré doré le rend lisible partout.
 */
export default function Logo({ taille = 48, className = '', priority = false }: { taille?: number; className?: string; priority?: boolean }) {
  const marge = Math.max(3, Math.round(taille * 0.06))
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,.18)] ring-2 ring-anareka-or ${className}`}
      style={{ width: taille, height: taille, padding: marge }}
    >
      <Image src="/logo.png" alt="ANAREKA-CI" width={taille * 2} height={taille * 2} priority={priority} className="h-full w-full rounded-full object-cover" />
    </span>
  )
}
