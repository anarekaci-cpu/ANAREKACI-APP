import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMembreParCompte } from '@/lib/membres'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'

export default async function AttenteValidationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membre } = await getMembreParCompte(supabase, user.id)

  if (membre?.statut === 'actif') {
    redirect('/dashboard')
  }

  const titre = membre
    ? 'Compte en attente de validation'
    : 'Fiche membre introuvable'

  const message = membre
    ? 'Votre compte a bien été créé. Le bureau doit encore valider votre adhésion avant l\'accès complet.'
    : 'Votre connexion fonctionne, mais aucune fiche membre n\'a été trouvée. Réessayez de vous inscrire ou contactez le bureau.'

  return (
    <main className="min-h-screen flex items-center justify-center bg-anareka-ivoire px-4">
      <div className="w-full max-w-md bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-or shadow-anareka p-8 text-center animate-fade-up">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="font-serif text-2xl font-bold text-anareka-vert mb-2">{titre}</h1>
        <p className="text-anareka-gris text-sm mb-6">{message}</p>

        {membre && (
          <p className="text-xs text-anareka-gris mb-6">
            Statut actuel : <span className="font-semibold text-anareka-terre">{membre.statut}</span>
          </p>
        )}

        <div className="flex flex-col gap-3">
          {!membre && (
            <Link
              href="/register"
              className="inline-block bg-anareka-vert text-white font-semibold text-sm uppercase tracking-wide rounded-anareka py-2.5 hover:bg-anareka-vert-clair transition-colors"
            >
              Réessayer l&apos;inscription
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-anareka-vert font-medium hover:text-anareka-or transition-colors text-sm border border-anareka-bordure rounded-anareka py-2.5"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
