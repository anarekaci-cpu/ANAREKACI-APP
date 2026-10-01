import Image from 'next/image'

/** Le logo est toujours posé sur un disque blanc : son texte reste lisible quel que soit le fond. */
export default function Logo({ taille = 48, className = '', priority = false }: { taille?: number; className?: string; priority?: boolean }) {
  const marge = Math.max(3, Math.round(taille * 0.06))
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_-6px_rgba(12,42,29,.55)] ring-1 ring-black/5 ${className}`}
      style={{ width: taille, height: taille, padding: marge }}
    >
      <Image src="/logo.png" alt="ANAREKA-CI" width={taille * 2} height={taille * 2} priority={priority} className="h-full w-full rounded-full object-cover" />
    </span>
  )
}
