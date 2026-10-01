import { register } from '@/app/auth/actions'
import Logo from '@/components/Logo'
import { Flash, champCls, labelCls, boutonPleinCls } from '@/components/ui'
import type { FlashParams } from '@/lib/flash'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: FlashParams
}) {
  const { erreur, succes } = await searchParams


  return (
    <main className="hero-aurora min-h-dvh flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-sm bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-5 sm:p-8 animate-fade-up">
        <div className="flex justify-center mb-3"><Logo taille={72} priority /></div>
        <h1 className="font-serif text-2xl font-bold text-center text-anareka-vert mb-1">ANAREKA-CI</h1>
        <p className="text-center text-anareka-gris text-sm mb-6">Créer un compte membre</p>

        <Flash erreur={erreur} succes={succes} />

        <form action={register} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nom</label>
              <input name="nom" type="text" required placeholder="Koné" className={champCls} />
            </div>
            <div>
              <label className={labelCls}>Prénom(s)</label>
              <input name="prenoms" type="text" required placeholder="Aya Marie" className={champCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Sexe</label>
            <select name="sexe" required className={champCls}>
              <option value="">Sélectionner</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Téléphone</label>
            <input name="telephone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="07 00 00 00 00" className={champCls} />
            <p className="text-xs text-anareka-gris mt-1">Votre numéro vous servira d&apos;identifiant</p>
          </div>
          <div>
            <label className={labelCls}>Commune / Quartier</label>
            <input name="commune_quartier" type="text" required placeholder="Cocody, Yopougon..." className={champCls} />
          </div>
          <div>
            <label className={labelCls}>Type d&apos;activité</label>
            <input name="type_activite" type="text" required placeholder="Vente d&apos;attiéké, commerce..." className={champCls} />
          </div>
          <div>
            <label className={labelCls}>Mot de passe</label>
            <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="8 caractères minimum" className={champCls} />
          </div>
          <button type="submit" className={boutonPleinCls}>
            Créer mon compte
          </button>
        </form>

        <p className="text-center text-sm text-anareka-gris mt-4">
          Déjà membre ?{' '}
          <a href="/login" className="text-anareka-vert font-semibold hover:text-anareka-or transition-colors">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  )
}