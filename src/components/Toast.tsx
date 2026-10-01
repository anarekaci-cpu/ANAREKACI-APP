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
  const COULEURS = ['#f5821f', '#0f9a54', '#ffffff', '#14301c', '#ffa24d']
  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-[60]" role={ko ? 'alert' : 'status'}>
      {!ko && (
        <div className="confetti" aria-hidden>
          {Array.from({ length: 28 }, (_, i) => (
            <i key={i} style={{ ['--i' as string]: i, ['--c' as string]: COULEURS[i % COULEURS.length], ['--x' as string]: `${((i * 53) % 260) - 130}px`, ['--y' as string]: `${90 + ((i * 29) % 200)}px`, ['--r' as string]: `${(i * 97) % 540}deg` }} />
          ))}
        </div>
      )}
      <div className={`toast relative overflow-hidden rounded-anareka-lg shadow-anareka-hov border-2 px-4 py-3 pr-10 text-sm backdrop-blur ${ko ? 'bg-red-50/95 border-red-300 text-red-800' : 'bg-white/95 border-anareka-vert-clair/40 text-anareka-noir'}`}>
        <div className="flex gap-3 items-start">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold ${ko ? 'bg-red-600' : 'bg-anareka-vert-clair'}`}>{ko ? '!' : '✓'}</span>
          <p className="font-medium">{erreur ?? succes}</p>
        </div>
        <button onClick={() => setOuvert(false)} aria-label="Fermer" className="absolute top-2 right-3 text-lg leading-none opacity-50 hover:opacity-100">×</button>
        <div className={`toast__bar absolute bottom-0 left-0 right-0 h-0.5 ${ko ? 'bg-red-400' : 'bg-anareka-or'}`} />
      </div>
    </div>
  )
}
