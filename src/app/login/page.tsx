import { login } from '@/app/auth/actions'
import Logo from '@/components/Logo'
import { Flash, champCls, labelCls, boutonPleinCls } from '@/components/ui'
import type { FlashParams } from '@/lib/flash'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: FlashParams
}) {
  const { erreur, succes } = await searchParams


  return (
    <main className="hero-aurora min-h-dvh flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-5 sm:p-8 animate-fade-up">
        <div className="flex justify-center mb-3"><Logo taille={72} priority /></div>
        <h1 className="font-serif text-2xl font-bold text-center text-anareka-vert mb-1">ANAREKA-CI</h1>
        <p className="text-center text-anareka-gris text-sm mb-6">Espace membres</p>

        <Flash erreur={erreur} succes={succes} />

        <form action={login} className="space-y-4">
          <div>
            <label className={labelCls}>Téléphone</label>
            <input name="telephone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="07 00 00 00 00" className={champCls} />
          </div>
          <div>
            <label className={labelCls}>Mot de passe</label>
            <input name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className={champCls} />
          </div>
          <button type="submit" className={boutonPleinCls}>
            Se connecter
          </button>
        </form>

        <p className="text-center text-xs text-anareka-gris mt-3">
          Mot de passe oublié ? Contactez le bureau : il peut le réinitialiser pour vous.
        </p>

        <p className="text-center text-sm text-anareka-gris mt-4">
          Pas encore membre ?{' '}
          <a href="/register" className="text-anareka-vert font-semibold hover:text-anareka-or transition-colors">
            S&apos;inscrire
          </a>
        </p>
      </div>
    </main>
  )
}