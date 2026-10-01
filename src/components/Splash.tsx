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
 * Écran d'ouverture animé : une seule fois par session de navigateur (pas à chaque page).
 * La disparition est gérée en CSS pur (`animation: splash-out`) ; un clic la raccourcit.
 * Désactivé si l'utilisateur a demandé « mouvement réduit ».
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
      <div className="splash__glow" />
      <div className="splash__logo">
        <svg className="splash__ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" />
        </svg>
        <Logo taille={132} priority />
      </div>
      <div className="splash__title">
        {'ANAREKA-CI'.split('').map((l, i) => (
          <span key={i} style={{ ['--i' as string]: i }}>{l}</span>
        ))}
      </div>
      <div className="splash__line" />
      <p className="splash__tag">Attiéké de Côte d&apos;Ivoire</p>
      <span className="splash__skip">Toucher pour passer</span>
    </div>
  )
}
