import Link from 'next/link'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { Badge } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'

export default async function AttenteValidationPage() {
  const membre = await exigerMembre()
  if (membre.statut === 'actif') redirect('/dashboard')

  return (
    <main className="min-h-dvh flex items-center justify-center bg-anareka-ivoire px-4">
      <div className="w-full max-w-md bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-5 sm:p-8 text-center animate-fade-up">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="font-serif text-2xl font-bold text-anareka-vert mb-2">Compte en attente de validation</h1>
        <p className="text-anareka-gris text-sm mb-6">
          Votre compte a bien été créé. Le bureau doit encore valider votre adhésion avant l&apos;accès complet.
        </p>
        <p className="text-xs text-anareka-gris mb-6">
          Statut actuel : <Badge ton="or">{membre.statut.replace('_', ' ')}</Badge>
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/droit-inscription"
            className="inline-block bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka py-2.5 hover:bg-anareka-vert-clair transition-colors"
          >
            Voir mon droit d&apos;inscription
          </Link>
          <form action={logout}>
            <button type="submit" className="w-full text-anareka-vert font-medium hover:text-anareka-or transition-colors text-sm border border-anareka-bordure rounded-anareka py-2.5">
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
