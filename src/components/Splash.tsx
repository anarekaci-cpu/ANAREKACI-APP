'use client'

import Logo from './Logo'
import { useEffect, useSyncExternalStore } from 'react'

const CLE = 'anareka_splash_vu'
const subscribe = () => () => {}
const dejaVu = () => {
  try {
    return sessionStorage.getItem(CLE) === '1'
  } catch {
    return false
  }
}

/**
 * Ouverture : sept bandes de pagne se tissent depuis les deux bords, le logo (sur disque blanc)
 * surgit au centre avec une onde, les lettres retombent une à une, puis l'écran se referme en iris.
 * Une seule fois par session ; un toucher la raccourcit ; désactivée si « mouvement réduit ».
 */
export default function Splash() {
  const vu = useSyncExternalStore(subscribe, dejaVu, () => false)
  useEffect(() => {
    try {
      sessionStorage.setItem(CLE, '1')
    } catch {
      /* navigation privée : on ignore */
    }
  }, [])

  if (vu) return null
  return (
    <div className="splash" role="presentation" onClick={(e) => (e.currentTarget.style.display = 'none')} aria-hidden>
      <div className="splash__bandes">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="splash__bande" style={{ ['--i' as string]: i, ['--from' as string]: i % 2 ? '110%' : '-110%' }} />
        ))}
      </div>
      <div className="splash__centre">
        <div className="relative">
          <span className="splash__halo" />
          <Logo taille={124} priority />
        </div>
        <div className="splash__titre">
          {'ANAREKA-CI'.split('').map((l, i) => (
            <span key={i} style={{ ['--i' as string]: i }}>{l}</span>
          ))}
        </div>
        <p className="splash__tag">L&apos;attiéké, ensemble.</p>
      </div>
      <span className="splash__skip">Touchez pour passer</span>
    </div>
  )
}
