'use server'

import { redirect } from 'next/navigation'
import { aAccesAdmin } from '@/config/association'
import { fermerSession, ouvrirSession } from '@/lib/auth/session'
import { aller } from '@/lib/flash'
import { authentifier, inscrireMembre } from '@/services/membres'

const texte = (f: FormData, nom: string) => (typeof f.get(nom) === 'string' ? (f.get(nom) as string) : '')

export async function login(formData: FormData) {
  const telephone = texte(formData, 'telephone')
  const motDePasse = texte(formData, 'password')
  if (!telephone || !motDePasse) aller('/login', { erreur: 'Renseignez votre téléphone et votre mot de passe.' })

  const membre = authentifier(telephone, motDePasse)
  if (!membre) aller('/login', { erreur: 'Téléphone ou mot de passe incorrect.' })

  await ouvrirSession(membre.id)
  // Tout rôle de direction (admin, bureau, trésorier, secrétaire) arrive dans l'espace admin.
  // (Avant, seul « admin » y était envoyé : le bureau atterrissait sur le tableau de bord membre.)
  redirect(aAccesAdmin(membre.role) ? '/admin' : '/dashboard')
}

export async function register(formData: FormData) {
  const sexe = texte(formData, 'sexe')
  if (sexe !== 'homme' && sexe !== 'femme') aller('/register', { erreur: 'Sélectionnez le sexe.' })

  const resultat = inscrireMembre({
    nom: texte(formData, 'nom'),
    prenoms: texte(formData, 'prenoms'),
    sexe,
    telephone: texte(formData, 'telephone'),
    commune_quartier: texte(formData, 'commune_quartier'),
    type_activite: texte(formData, 'type_activite'),
    motDePasse: texte(formData, 'password'),
  })
  if (!resultat.ok) aller('/register', { erreur: resultat.erreur })

  await ouvrirSession(resultat.data.id)
  redirect('/droit-inscription')
}

export async function logout() {
  await fermerSession()
  redirect('/login')
}
