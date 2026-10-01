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
        <h1 className="font-serif text-3xl font-extrabold leading-tight">Content de vous revoir</h1>
        <p className="text-anareka-gris mt-1 mb-6">Entrez votre numéro de téléphone et votre mot de passe.</p>

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
          <a href="/register" className="text-anareka-vert font-semibold hover:text-anareka-terre transition-colors">
            S&apos;inscrire
          </a>
        </p>
        </div>
      </div>
    </main>
  )
}