import Link from 'next/link'
import { redirect } from 'next/navigation'
import CarteMembre from '@/components/CarteMembre'
import CountUp from '@/components/CountUp'
import Icone from '@/components/Icones'
import Logo from '@/components/Logo'
import Pagne from '@/components/Pagne'
import Vapeur from '@/components/Vapeur'
import { ASSOCIATION, TARIFS, aAccesAdmin, formatFCFA } from '@/config/association'
import { membreCourant } from '@/lib/auth/dal'
import { lire } from '@/lib/db/store'

const TITRE = ["L'attiéké,", 'ensemble', 'et', 'bien', 'organisé.']

const AVANTAGES = [
  { icone: 'carte', titre: 'Votre carte dans la poche', texte: 'Votre carte de membre sur votre téléphone, à montrer au bureau ou à télécharger en PDF.' },
  { icone: 'cotisations', titre: 'Vos cotisations en clair', texte: 'Douze mois, un coup d’œil. Vous déclarez votre paiement, le trésorier valide, votre reçu arrive.' },
  { icone: 'formations', titre: 'Formations et réunions', texte: 'Inscrivez-vous aux formations et retrouvez les dates des assemblées sans courir après l’info.' },
  { icone: 'annonces', titre: 'Annonces et messages', texte: 'Les nouvelles du bureau arrivent ici, et vous pouvez écrire directement aux autres membres.' },
] as const

const DEMO = ['paye', 'paye', 'paye', 'paye', 'paye', 'en_attente', 'non_paye', 'non_paye', 'non_paye', 'non_paye', 'non_paye', 'non_paye'] as const

export default async function Accueil() {
  const membre = await membreCourant()
  if (membre) redirect(aAccesAdmin(membre.role) ? '/admin' : '/dashboard')
  const actifs = lire().membres.filter((m) => m.statut === 'actif').length

  return (
    <main className="overflow-x-clip">
      {/* ───── Ouverture ───── */}
      <section className="hero-aurora text-white">
        <Vapeur />
        <span className="aurore bg-anareka-or/40 -top-24 -right-24" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-5 pt-6 pb-16 sm:pb-24">
          <nav className="reveal flex items-center justify-between" aria-label="Accueil">
            <span className="flex items-center gap-3 font-serif text-xl font-extrabold">
              <Logo taille={46} priority />
              {ASSOCIATION.sigle}
            </span>
            <Link href="/login" className="btn border-2 border-white/35 px-5 py-2 text-sm hover:bg-white hover:text-anareka-noir">
              Connexion
            </Link>
          </nav>

          <div className="grid md:grid-cols-[1.15fr_1fr] gap-10 items-center mt-10 sm:mt-16">
            <div>
              <h1 className="mots font-serif text-[2.7rem] sm:text-7xl font-extrabold leading-[0.98]" aria-label={TITRE.join(' ')}>
                {TITRE.map((m, i) => (
                  <span key={i} aria-hidden style={{ ['--i' as string]: i }} className="mr-[.22em]">{m}</span>
                ))}
              </h1>
              <p className="reveal mt-6 text-lg text-white/80 max-w-md" style={{ ['--i' as string]: 6 }}>
                L’espace des restaurateurs et kiosques d’attiéké de Côte d’Ivoire : adhésion, cotisations, formations et annonces.
              </p>
              <div className="reveal flex flex-col sm:flex-row gap-3 mt-8" style={{ ['--i' as string]: 8 }}>
                <Link href="/register" className="btn btn-shine animate-btn-pulse bg-anareka-or text-anareka-noir px-8 py-4 text-lg shadow-anareka-or">
                  Devenir membre
                  <Icone nom="fleche" taille={22} />
                </Link>
                <Link href="/login" className="btn border-2 border-white/35 px-8 py-4 text-lg hover:bg-white/10">
                  J’ai déjà un compte
                </Link>
              </div>
            </div>

            <div className="reveal" style={{ ['--i' as string]: 5 }}>
              <CarteMembre nom="Awa Diabaté" numero="AN260042" depuis="12 mars 2026" role="Membre" actif />
            </div>
          </div>
        </div>
        <div className="pagne-band pagne-band--anime pagne-band--epais" aria-hidden />
      </section>

      {/* ───── Défilé ───── */}
      <div className="marquee bg-anareka-or text-anareka-noir font-serif font-extrabold text-lg py-3" aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="marquee__piste">
            {['Adhésion', 'Cotisations', 'Formations', 'Annonces', 'Messagerie', 'Carte de membre', 'Reçus officiels'].map((t) => (
              <span key={t} className="flex items-center gap-8">{t}<span className="h-2 w-2 rotate-45 bg-anareka-noir" /></span>
            ))}
          </div>
        ))}
      </div>

      {/* ───── Le pagne ───── */}
      <section className="max-w-5xl mx-auto px-5 py-16 sm:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div className="sr">
          <h2 className="font-serif text-4xl sm:text-5xl font-extrabold leading-[1.02]">Chaque mois payé tisse un carreau.</h2>
          <p className="mt-4 text-lg text-anareka-gris max-w-md">
            À la fin de l’année, votre pagne est complet. Les carreaux qui clignotent attendent la validation du trésorier.
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-3 max-w-md">
            {[
              [<CountUp key="a" valeur={actifs} />, 'membres actifs'],
              [<CountUp key="b" valeur={TARIFS.cotisationMensuelle} suffixe=" F" />, 'par mois'],
              [<CountUp key="c" valeur={12} />, 'carreaux par an'],
            ].map(([v, l], i) => (
              <div key={i}>
                <dd className="font-serif text-3xl font-extrabold text-anareka-vert">{v}</dd>
                <dt className="text-sm text-anareka-gris">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="sr rounded-[28px] bg-anareka-attieke p-5 sm:p-6 border border-anareka-bordure">
          <Pagne mois={[...DEMO]} annee={new Date().getFullYear()} />
        </div>
      </section>

      {/* ───── Ce que tu y trouves ───── */}
      <section className="bg-white border-y border-anareka-bordure">
        <div className="max-w-5xl mx-auto px-5 py-16 sm:py-24">
          <h2 className="sr font-serif text-4xl sm:text-5xl font-extrabold max-w-xl leading-[1.02]">Tout ce qu’il vous faut, au même endroit.</h2>
          <ul className="mt-10 grid sm:grid-cols-2 gap-x-10">
            {AVANTAGES.map((a) => (
              <li key={a.titre} className="sr flex gap-4 py-6 border-t border-anareka-bordure">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-anareka-vert text-white"><Icone nom={a.icone} taille={24} /></span>
                <div>
                  <h3 className="font-serif text-xl font-bold">{a.titre}</h3>
                  <p className="text-anareka-gris mt-1">{a.texte}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── Les étapes (une vraie suite : on numérote) ───── */}
      <section className="max-w-5xl mx-auto px-5 py-16 sm:py-24">
        <h2 className="sr font-serif text-4xl sm:text-5xl font-extrabold leading-[1.02]">Trois étapes, pas une de plus.</h2>
        <ol className="mt-10 grid md:grid-cols-3 gap-4">
          {[
            ['Créez votre compte', 'Votre numéro de téléphone suffit. Deux minutes.'],
            ['Réglez le droit d’inscription', `${formatFCFA(TARIFS.droitInscription)}, une seule fois. Le bureau valide votre adhésion.`],
            ['Cotisez chaque mois', `${formatFCFA(TARIFS.cotisationMensuelle)} par mois. Le suivi et les reçus sont automatiques.`],
          ].map(([t, d], i) => (
            <li key={t} className="sr relative rounded-[26px] border-2 border-anareka-bordure bg-white p-6 overflow-hidden">
              <span className="font-serif text-[5.5rem] font-extrabold leading-none text-anareka-or/20 absolute -top-2 right-3 select-none" aria-hidden>{i + 1}</span>
              <h3 className="relative font-serif text-xl font-bold pr-10">{t}</h3>
              <p className="relative text-anareka-gris mt-2">{d}</p>
            </li>
          ))}
        </ol>
        <div className="sr mt-10 text-center">
          <Link href="/register" className="btn btn-shine bg-anareka-or text-anareka-noir px-10 py-4 text-lg shadow-anareka-or">
            Rejoindre l’association
            <Icone nom="fleche" taille={22} />
          </Link>
        </div>
      </section>

      <footer className="bg-anareka-terre-fonce text-white/75 text-center text-sm">
        <div className="pagne-band" aria-hidden />
        <div className="px-6 py-10">
          <div className="flex justify-center"><Logo taille={56} /></div>
          <p className="font-serif text-xl font-extrabold text-white mt-3">{ASSOCIATION.sigle}</p>
          <p className="mt-1 max-w-sm mx-auto">{ASSOCIATION.nom}</p>
        </div>
      </footer>
    </main>
  )
}
