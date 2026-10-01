'use server'

import { revalidatePath } from 'next/cache'
import { exigerMembre } from '@/lib/auth/dal'
import { aller } from '@/lib/flash'
import { changerMotDePasse, mettreAJourProfil } from '@/services/membres'

const texte = (f: FormData, nom: string) => (typeof f.get(nom) === 'string' ? (f.get(nom) as string) : '')

/**
 * L'identifiant du membre vient de la SESSION, jamais du formulaire (avant, un champ caché
 * `membreId` était envoyé par le navigateur) et le téléphone n'est plus modifiable ici :
 * c'est l'identifiant de connexion, son changement passe par le bureau.
 */
export async function majProfil(formData: FormData) {
  const membre = await exigerMembre()
  const r = mettreAJourProfil(membre.id, {
    nom: texte(formData, 'nom'),
    prenoms: texte(formData, 'prenoms'),
    email: texte(formData, 'email') || null,
    commune_quartier: texte(formData, 'commune_quartier') || null,
    type_activite: texte(formData, 'type_activite') || null,
  })
  if (!r.ok) aller('/profil', { erreur: r.erreur })
  revalidatePath('/', 'layout')
  aller('/profil', { succes: 'Profil mis à jour.' })
}

export async function majMotDePasse(formData: FormData) {
  const membre = await exigerMembre()
  const nouveau = texte(formData, 'nouveau')
  if (nouveau !== texte(formData, 'confirmation')) aller('/profil', { erreur: 'La confirmation ne correspond pas.' })
  const r = changerMotDePasse(membre.id, texte(formData, 'actuel'), nouveau)
  if (!r.ok) aller('/profil', { erreur: r.erreur })
  aller('/profil', { succes: 'Mot de passe modifié.' })
}
