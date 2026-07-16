"use client"

import { useEffect } from "react"
import { effacerNotificationMotDePasse } from "@/app/admin/membres/actions"

export default function PasswordResetBanner({
  nom,
  motDePasse,
}: {
  nom: string
  motDePasse: string
}) {
  useEffect(() => {
    // Dès que la bannière s'affiche, on détruit le cookie côté serveur :
    // le mot de passe ne pourra plus être relu, même en rechargeant la page.
    effacerNotificationMotDePasse()
  }, [])

  return (
    <div className="bg-green-50 border border-green-200 rounded-anareka p-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">✅</span>
        <div>
          <h3 className="font-semibold text-green-700">Mot de passe réinitialisé</h3>
          <p className="text-sm text-green-700">
            {nom} : <span className="font-mono">{motDePasse}</span>
          </p>
          <p className="text-xs text-green-600 mt-1">
            Ce mot de passe ne sera plus affiché après ce chargement — communiquez-le
            au membre maintenant.
          </p>
        </div>
      </div>
    </div>
  )
}