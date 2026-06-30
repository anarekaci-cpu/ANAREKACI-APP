import { login } from '@/app/auth/actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-green-700 mb-2">ANAREKA-CI</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Espace membres</p>

        {searchParams.error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {searchParams.error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identifiant
            </label>
            <input
              name="identifiant"
              type="text"
              required
              placeholder="Votre matricule ou pseudo"
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
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white font-semibold rounded-lg py-2.5 hover:bg-green-800 transition"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Pas encore membre ?{' '}
          <a href="/register" className="text-green-700 font-medium hover:underline">
            S'inscrire
          </a>
        </p>
      </div>
    </main>
  )
}
