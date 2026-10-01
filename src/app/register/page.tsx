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
    <main className="min-h-dvh flex flex-col bg-anareka-ivoire">
      <div className="hero-aurora text-white">
        <div className="pagne-band pagne-band--anime pagne-band--epais" aria-hidden />
        <div className="relative max-w-md w-full mx-auto px-5 pt-8 pb-14 flex items-center gap-4">
          <Logo taille={64} priority />
          <div>
            <p className="font-serif text-2xl font-extrabold leading-none">ANAREKA<span className="text-anareka-or">-CI</span></p>
            <p className="text-sm text-white/70 mt-1">Espace des membres</p>
          </div>
        </div>
      </div>
      <div className="relative -mt-8 w-full max-w-md mx-auto px-4 pb-10 flex-1">
        <div className="animate-fade-up rounded-[28px] bg-white border border-anareka-bordure shadow-anareka-hov p-5 sm:p-7">
        <h1 className="font-serif text-3xl font-extrabold leading-tight">Rejoignez l’association</h1>
        <p className="text-anareka-gris mt-1 mb-6">Un compte, c’est votre numéro de téléphone et un mot de passe.</p>

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
          <a href="/login" className="text-anareka-vert font-semibold hover:text-anareka-terre transition-colors">
            Se connecter
          </a>
        </p>
        </div>
      </div>
    </main>
  )
}