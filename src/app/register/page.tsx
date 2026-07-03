import { register } from '@/app/auth/actions'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-anareka-vert mb-1.5"
  const champCls = "w-full bg-anareka-ivoire border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm text-anareka-noir focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20 focus:bg-white transition"

  return (
    <main className="min-h-screen flex items-center justify-center bg-anareka-ivoire px-4 py-8">
      <div className="w-full max-w-sm bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-8 animate-fade-up">
        <h1 className="font-serif text-2xl font-bold text-center text-anareka-vert mb-1">ANAREKA-CI</h1>
        <p className="text-center text-anareka-gris text-sm mb-6">Créer un compte membre</p>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-anareka px-4 py-3 mb-4">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={register} className="space-y-4">
          <div>
            <label className={labelCls}>
              Nom complet
            </label>
            <input
              name="nom_complet"
              type="text"
              required
              placeholder="Koné Aya Marie"
              className={champCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              Identifiant
            </label>
            <input
              name="identifiant"
              type="text"
              required
              placeholder="aya.kone"
              className={champCls}
            />
            <p className="text-xs text-anareka-gris mt-1">Choisissez un identifiant pour vous connecter</p>
          </div>
          <div>
            <label className={labelCls}>
              Téléphone
            </label>
            <input
              name="telephone"
              type="tel"
              autoComplete="off"
              placeholder="+225 07 00 00 00 00"
              className={champCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="8 caractères minimum"
              className={champCls}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka py-2.5 hover:bg-anareka-vert-clair transition-colors shadow-anareka"
          >
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