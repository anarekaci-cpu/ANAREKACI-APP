'use client'

import { useEffect, useState } from 'react'

/** Notification flottante : auto-fermeture après 7 s, fermable, et nettoie l'URL (?erreur=… / ?succes=…) pour ne pas se rejouer au rafraîchissement. */
export default function Toast({ erreur, succes }: { erreur?: string; succes?: string }) {
  const [ouvert, setOuvert] = useState(true)

  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.has('erreur') || url.searchParams.has('succes')) {
        url.searchParams.delete('erreur')
        url.searchParams.delete('succes')
        window.history.replaceState(window.history.state, '', url.pathname + (url.search || ''))
      }
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setOuvert(false), 7000)
    return () => clearTimeout(t)
  }, [])

  if (!ouvert) return null
  const ko = !!erreur
  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-[60]" role={ko ? 'alert' : 'status'}>
      <div className={`toast relative overflow-hidden rounded-anareka-lg shadow-anareka-hov border px-4 py-3 pr-10 text-sm backdrop-blur ${ko ? 'bg-red-50/95 border-red-200 text-red-800' : 'bg-white/95 border-anareka-or/40 text-anareka-vert'}`}>
        <div className="flex gap-3 items-start">
          <span className="text-lg leading-none">{ko ? '⚠️' : '✅'}</span>
          <p className="font-medium">{erreur ?? succes}</p>
        </div>
        <button onClick={() => setOuvert(false)} aria-label="Fermer" className="absolute top-2 right-3 text-lg leading-none opacity-50 hover:opacity-100">×</button>
        <div className={`toast__bar absolute bottom-0 left-0 right-0 h-0.5 ${ko ? 'bg-red-400' : 'bg-anareka-or'}`} />
      </div>
    </div>
  )
}
