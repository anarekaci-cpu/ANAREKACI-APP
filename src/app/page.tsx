import Logo from '@/components/Logo'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import CountUp from '@/components/CountUp'
import { ASSOCIATION, TARIFS, aAccesAdmin, formatFCFA } from '@/config/association'
import { membreCourant } from '@/lib/auth/dal'
import { lire } from '@/lib/db/store'

const AVANTAGES = [
  { icone: '🪪', titre: 'Carte de membre numérique', texte: 'Votre carte ANAREKA-CI toujours dans votre poche, téléchargeable en PDF.' },
  { icone: '💰', titre: 'Cotisations en toute clarté', texte: 'Suivez vos 12 mois, déclarez vos paiements et recevez vos reçus officiels.' },
  { icone: '📚', titre: 'Formations & événements', texte: "Inscrivez-vous aux formations, retrouvez les réunions et assemblées de l'association." },
  { icone: '📣', titre: 'Annonces & messagerie', texte: 'Restez informé en temps réel et échangez directement avec les autres membres.' },
]

const ETAPES = [
  ['Créez votre compte', 'Avec votre numéro de téléphone, en moins de deux minutes.'],
  ["Réglez le droit d'inscription", `${formatFCFA(TARIFS.droitInscription)}, une seule fois. Le bureau valide votre adhésion.`],
  ['Cotisez chaque mois', `${formatFCFA(TARIFS.cotisationMensuelle)} par mois, suivi et reçus automatiques.`],
]

export default async function Accueil() {
  const membre = await membreCourant()
  if (membre) redirect(aAccesAdmin(membre.role) ? '/admin' : '/dashboard')
  const actifs = lire().membres.filter((m) => m.statut === 'actif').length

  return (
    <main className="bg-anareka-ivoire overflow-x-hidden">
      <section className="hero-aurora text-white">
        <div className="hero-pattern absolute inset-0 opacity-70" />
        <div className="relative max-w-5xl mx-auto px-6 pt-8 pb-24 sm:pb-32">
          <nav className="reveal flex items-center justify-between" style={{ ['--i' as string]: 0 }}>
            <span className="flex items-center gap-3 font-serif text-xl font-semibold">
              <Logo taille={44} />
              {ASSOCIATION.sigle}
            </span>
            <Link href="/login" className="text-xs font-semibold uppercase tracking-wide border border-anareka-or/60 rounded-anareka px-4 py-2 hover:bg-anareka-or hover:text-anareka-noir transition-colors">
              Connexion
            </Link>
          </nav>

          <div className="grid md:grid-cols-[1.3fr_1fr] gap-8 items-center mt-8 sm:mt-24">
            <div>
              <p className="reveal text-[11px] font-semibold uppercase tracking-[0.3em] text-anareka-or-clair" style={{ ['--i' as string]: 1 }}>Espace membres</p>
              <h1 className="reveal font-serif text-4xl sm:text-6xl font-bold leading-[1.08] text-center md:text-left mt-3" style={{ ['--i' as string]: 2 }}>
                La communauté de l&apos;<span className="text-shimmer-gold">attiéké</span>,<br />réunie au même endroit.
              </h1>
              <p className="reveal mt-5 text-white/75 max-w-xl" style={{ ['--i' as string]: 3 }}>{ASSOCIATION.nom}. Adhésion, cotisations, formations et annonces : tout se gère ici, simplement.</p>
              <div className="reveal flex flex-col sm:flex-row gap-3 mt-8" style={{ ['--i' as string]: 4 }}>
                <Link href="/register" className="btn-shine animate-btn-pulse text-center bg-anareka-or text-anareka-noir font-semibold text-sm uppercase tracking-wide rounded-anareka px-8 py-3.5 hover:bg-anareka-or-clair transition-colors">
                  Devenir membre
                </Link>
                <Link href="/login" className="text-center border border-white/30 text-white font-semibold text-sm uppercase tracking-wide rounded-anareka px-8 py-3.5 hover:bg-white/10 transition-colors">
                  Espace membres
                </Link>
              </div>
            </div>

            <div className="reveal flex justify-center order-first md:order-last" style={{ ['--i' as string]: 3 }}>
              <div className="relative animate-float">
                <div className="absolute -inset-6 rounded-full bg-anareka-or/20 blur-2xl" />
                <Logo taille={220} priority className="relative shadow-anareka-or" />
              </div>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 1440 80" className="absolute bottom-[-1px] left-0 w-full text-anareka-ivoire" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0 80V40c240 40 480 40 720 10S1200 0 1440 30v50z" />
        </svg>
      </section>

      <section className="max-w-5xl mx-auto px-6 -mt-6 relative">
        <div className="reveal grid grid-cols-3 gap-4 text-center bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka-hov p-6">
          {[
            [<CountUp key="a" valeur={actifs} />, 'membres actifs'],
            [<CountUp key="b" valeur={TARIFS.cotisationMensuelle} suffixe=" F" />, 'par mois'],
            [<CountUp key="c" valeur={12} />, 'mois suivis / an'],
          ].map(([v, l], i) => (
            <div key={i}>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-anareka-vert">{v}</div>
              <div className="text-xs text-anareka-gris mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl font-bold text-anareka-vert text-center">Tout ce dont vous avez besoin</h2>
        <div className="w-14 h-0.5 bg-anareka-or mx-auto mt-3 mb-10" />
        <div className="grid sm:grid-cols-2 gap-5">
          {AVANTAGES.map((a, i) => (
            <div key={a.titre} className="reveal card-lift bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-vert hover:border-t-anareka-or shadow-anareka p-6" style={{ ['--i' as string]: i }}>
              <div className="text-3xl mb-3">{a.icone}</div>
              <h3 className="font-semibold text-anareka-vert">{a.titre}</h3>
              <p className="text-sm text-anareka-gris mt-1">{a.texte}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-anareka-vert-pale py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-anareka-vert text-center">Comment ça marche</h2>
          <div className="w-14 h-0.5 bg-anareka-or mx-auto mt-3 mb-10" />
          <ol className="grid md:grid-cols-3 gap-6">
            {ETAPES.map(([t, d], i) => (
              <li key={t} className="reveal text-center" style={{ ['--i' as string]: i }}>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-anareka-vert text-anareka-or-clair font-serif text-xl font-bold shadow-anareka">{i + 1}</span>
                <h3 className="font-semibold text-anareka-vert mt-4">{t}</h3>
                <p className="text-sm text-anareka-gris mt-1">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="bg-anareka-noir text-white/60 text-center text-xs py-8 px-6">
        <p className="font-serif text-lg text-white">{ASSOCIATION.sigle}</p>
        <p className="mt-1">{ASSOCIATION.nom}</p>
      </footer>
    </main>
  )
}
