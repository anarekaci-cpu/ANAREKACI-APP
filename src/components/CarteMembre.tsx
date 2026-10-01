'use client'

import { useRef, useState } from 'react'
import Logo from './Logo'

/**
 * Carte de membre « vivante » : elle se balance seule, suit le doigt ou la souris avec un reflet
 * holographique, et se retourne d'un toucher pour montrer le verso.
 */
export default function CarteMembre({ nom, numero, depuis, role, actif }: { nom: string; numero: string; depuis: string; role: string; actif: boolean }) {
  const corps = useRef<HTMLDivElement>(null)
  const [retournee, setRetournee] = useState(false)
  const [actifPointeur, setActifPointeur] = useState(false)

  const bouger = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = corps.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setActifPointeur(true)
    el.style.setProperty('--ry', `${(px - 0.5) * 24}deg`)
    el.style.setProperty('--rx', `${(0.5 - py) * 18}deg`)
    el.style.setProperty('--gx', `${px * 100}%`)
    el.style.setProperty('--gy', `${py * 100}%`)
  }
  const relacher = () => {
    const el = corps.current
    if (!el) return
    setActifPointeur(false)
    for (const v of ['--ry', '--rx']) el.style.removeProperty(v)
  }
  const basculer = () => {
    setRetournee((v) => !v)
    try {
      navigator.vibrate?.(12)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="carte3d w-full max-w-md mx-auto" onPointerMove={bouger} onPointerLeave={relacher} onPointerUp={(e) => e.pointerType !== 'mouse' && relacher()}>
      <button type="button" onClick={basculer} aria-label={retournee ? 'Voir le recto de la carte' : 'Voir le verso de la carte'} className="block w-full text-left">
        <div ref={corps} className={`carte3d__corps ${retournee || actifPointeur ? '' : 'idle'}`} style={{ ['--flip' as string]: retournee ? 1 : 0 }}>
          {/* RECTO */}
          <div className="carte3d__face text-white" style={{ background: 'radial-gradient(120% 120% at 90% 0%, #2f8f4a 0%, #1d5a31 50%, #14301c 100%)' }}>
            <div className="pagne-band pagne-band--anime pagne-band--epais" aria-hidden />
            <div className="p-5 sm:p-6 h-[calc(100%-20px)] flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-extrabold leading-none">ANAREKA<span className="text-anareka-or">-CI</span></p>
                  <p className="text-xs mt-1.5 text-white/70">Carte de membre</p>
                </div>
                <Logo taille={58} />
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl text-anareka-or" style={{ letterSpacing: '.14em' }}>{numero}</p>
                <div className="relative -mx-5 sm:-mx-6 mt-2 bg-anareka-terre px-5 sm:px-6 py-2 shadow-[0_6px_14px_-6px_rgba(0,0,0,.6)]">
                  <span className="absolute -bottom-1.5 left-0 h-1.5 w-3 bg-anareka-terre-fonce [clip-path:polygon(0_0,100%_0,100%_100%)]" aria-hidden />
                  <span className="absolute -bottom-1.5 right-0 h-1.5 w-3 bg-anareka-terre-fonce [clip-path:polygon(0_0,100%_0,0_100%)]" aria-hidden />
                  <p className="font-serif text-lg sm:text-xl font-extrabold truncate">{nom}</p>
                </div>
                <div className="flex justify-between items-end text-xs text-white/70 mt-1.5 gap-2">
                  <span className="truncate">Membre depuis le {depuis} · {role}</span>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full font-bold ${actif ? 'bg-anareka-or text-anareka-noir' : 'bg-white/20 text-white'}`}>{actif ? 'Actif' : 'En attente'}</span>
                </div>
              </div>
            </div>
            <div className="carte3d__eclat" />
          </div>
          {/* VERSO */}
          <div className="carte3d__face carte3d__dos bg-anareka-terre-fonce text-white">
            <div className="pagne h-9 mt-5" aria-hidden />
            <div className="px-5 sm:px-6 pt-4">
              <p className="font-serif text-lg font-bold">Cette carte est personnelle.</p>
              <p className="text-sm text-white/70 mt-1">Présentez-la au bureau lors des réunions et des assemblées. En cas de perte, prévenez le secrétariat.</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="flex items-end gap-[3px] h-9" aria-hidden>
                  {Array.from({ length: 34 }, (_, i) => (
                    <i key={i} className="block bg-white/90" style={{ width: (i * 7) % 5 === 0 ? 4 : 2, height: `${55 + ((i * 17) % 45)}%` }} />
                  ))}
                </div>
                <span className="font-mono text-sm text-anareka-or" style={{ letterSpacing: '.12em' }}>{numero}</span>
              </div>
            </div>
            <div className="carte3d__eclat" />
          </div>
        </div>
      </button>
      <p className="text-center text-xs text-anareka-gris mt-3">Touchez la carte pour la retourner</p>
    </div>
  )
}
