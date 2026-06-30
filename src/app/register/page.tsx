import { register } from '@/app/auth/actions'

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-green-700 mb-2">ANAREKA-CI</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Créer un compte membre</p>

        {searchParams.error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {decodeURIComponent(searchParams.error)}
          </div>
        )}

        <form action={register} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              name="nom_complet"
              type="text"
              required
              placeholder="Koné Aya Marie"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identifiant (matricule ou pseudo)
            </label>
            <input
              name="identifiant"
              type="text"
              required
              placeholder="aya.kone ou M-0042"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">Ce sera votre identifiant de connexion</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              name="telephone"
              type="tel"
              placeholder="+225 07 00 00 00 00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="8 caractères minimum"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 hover:bg-green-800 transition"
          >
            Créer mon compte
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà membre ?{' '}
          <a href="/login" className="text-green-700 font-medium hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  )
}