'use client'

import { useEffect, useState } from 'react'

/** Nombre qui s'incrémente en douceur jusqu'à sa valeur (ease-out). */
export default function CountUp({ valeur, duree = 1200, suffixe = '' }: { valeur: number; duree?: number; suffixe?: string }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let debut: number | null = null
    let raf = 0
    const pas = (t: number) => {
      if (debut === null) debut = t
      const p = reduit ? 1 : Math.min(1, (t - debut) / duree)
      setN(Math.round(valeur * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(pas)
    }
    raf = requestAnimationFrame(pas)
    return () => cancelAnimationFrame(raf)
  }, [valeur, duree])

  return <span suppressHydrationWarning>{new Intl.NumberFormat('fr-FR').format(n).replace(/ | /g, ' ')}{suffixe}</span>
}
