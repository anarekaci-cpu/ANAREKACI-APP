import Link from 'next/link'
import { redirect } from 'next/navigation'
import CountUp from '@/components/CountUp'
import ProgressRing from '@/components/ProgressRing'
import { Badge, Flash, dateFR } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { resumeCotisations } from '@/services/cotisations'
import { droitDuMembre } from '@/services/droits'
import { annoncesPubliees, listerEvenements } from '@/services/contenu'
import { compterNonLues } from '@/services/notifications'
import { aAccesAdmin } from '@/config/association'

const ICONES = {
  profil: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  cotisations: 'M2 5h20v14H2zM2 10h20',
  paiements: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8',
  annonces: 'M3 11l18-5v12L3 14zM11.6 16.8a3 3 0 1 1-5.8-1.6',
  formations: 'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5',
  evenements: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  carte: 'M3 7h18v10H3zM3 11h18M7 15h3',
  messages: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
}

function Icone({ d }: { d: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

export default async function DashboardPage({ searchParams }: { searchParams: FlashParams }) {
  const { erreur, succes } = await searchParams
  const membre = await exigerMembre()

  // Les rôles de direction n'ont pas de droit d'inscription à régler.
  if (!aAccesAdmin(membre.role)) {
    const droit = droitDuMembre(membre.id)
    if (!droit || (droit.statut !== 'paye' && droit.statut !== 'en_attente_validation')) redirect('/droit-inscription')
  }

  const estActif = membre.statut === 'actif'
  const annee = new Date().getFullYear()
  const resume = resumeCotisations(membre.id, annee)
  const nonLues = compterNonLues(membre.id)
  const dernieresAnnonces = annoncesPubliees().slice(0, 2)
  const prochains = listerEvenements().filter((e) => e.date_debut >= new Date().toISOString()).slice(0, 2)
  const pourcent = Math.round((resume.nbPayes / 12) * 100)

  const cartes = [
    { href: '/carte', titre: 'Ma carte', sous: 'Carte de membre numérique', icone: ICONES.carte },
    { href: '/profil', titre: 'Mon profil', sous: 'Mes informations et mot de passe', icone: ICONES.profil },
    { href: '/cotisations', titre: 'Cotisations', sous: 'Mes paiements mensuels', icone: ICONES.cotisations },
    { href: '/paiements', titre: 'Mes paiements', sous: 'Historique et reçus', icone: ICONES.paiements },
    { href: '/annonces', titre: 'Annonces', sous: "Actualités de l'association", icone: ICONES.annonces },
    { href: '/evenements', titre: 'Événements', sous: 'Réunions et assemblées', icone: ICONES.evenements },
    { href: '/formations', titre: 'Formations', sous: "S'inscrire et télécharger", icone: ICONES.formations },
    { href: '/messages', titre: 'Messages', sous: 'Échanger avec les membres', icone: ICONES.messages },
  ]

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Flash erreur={erreur} succes={succes} />

      <section className="hero-aurora reveal rounded-anareka-lg border border-anareka-or/30 shadow-anareka-hov text-white mb-6">
        <div className="hero-pattern absolute inset-0 opacity-60" />
        <div className="relative p-7 sm:p-9 flex flex-col-reverse sm:flex-row items-center sm:items-stretch justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-xs text-anareka-or-clair uppercase tracking-[0.2em]">Bienvenue</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-1">{membre.nom_complet}</h1>
            <p className="text-sm text-white/70 mt-2">
              N° <span className="font-mono text-white">{membre.numero_membre}</span> · {membre.telephone}
            </p>
            <div className="mt-4">
              {estActif ? <Badge ton="vert">✓ Membre actif</Badge> : <Badge ton="or">⏳ En attente de validation</Badge>}
            </div>
          </div>
          <ProgressRing pourcent={pourcent} taille={132} clair>
            <span className="font-serif text-3xl font-bold leading-none"><CountUp valeur={pourcent} suffixe="%" /></span>
            <span className="text-[10px] uppercase tracking-wider text-anareka-or-clair mt-1">cotisé {annee}</span>
          </ProgressRing>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 mb-6 text-center">
        <div className="reveal card-lift bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4" style={{ ['--i' as string]: 1 }}>
          <div className="text-2xl font-bold text-anareka-vert"><CountUp valeur={resume.nbPayes} />/12</div>
          <div className="text-xs text-anareka-gris mt-1">mois payés</div>
        </div>
        <div className="reveal card-lift bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4" style={{ ['--i' as string]: 2 }}>
          <div className="text-2xl font-bold text-anareka-vert"><CountUp valeur={resume.resteAPayer} suffixe=" F" /></div>
          <div className="text-xs text-anareka-gris mt-1">reste à payer</div>
        </div>
        <Link href="/notifications" className="reveal card-lift bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4 hover:border-anareka-or" style={{ ['--i' as string]: 3 }}>
          <div className="text-2xl font-bold text-anareka-vert"><CountUp valeur={nonLues} /></div>
          <div className="text-xs text-anareka-gris mt-1">alerte{nonLues > 1 ? 's' : ''} non lue{nonLues > 1 ? 's' : ''}</div>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cartes.map((c, i) => (
          <Link
            key={c.href}
            href={c.href}
            style={{ ['--i' as string]: i + 2 }}
            className="reveal group card-lift bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-t-4 border-t-anareka-vert hover:border-t-anareka-or shadow-anareka p-5"
          >
            <div className="text-anareka-vert group-hover:text-anareka-or group-hover:scale-110 origin-left transition-all duration-300 mb-3">
              <Icone d={c.icone} />
            </div>
            <div className="font-semibold text-anareka-vert text-sm">{c.titre}</div>
            <div className="text-xs text-anareka-gris mt-1">{c.sous}</div>
          </Link>
        ))}
      </div>

      {(prochains.length > 0 || dernieresAnnonces.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          {prochains.length > 0 && (
            <section className="reveal" style={{ ['--i' as string]: 6 }}>
              <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-3">À venir</h2>
              <div className="space-y-3">
                {prochains.map((e) => (
                  <Link key={e.id} href="/evenements" className="card-lift block bg-anareka-blanc rounded-anareka border border-anareka-bordure border-l-4 border-l-anareka-or p-4">
                    <p className="font-semibold text-sm text-anareka-vert">{e.titre}</p>
                    <p className="text-xs text-anareka-gris mt-1">{dateFR(e.date_debut, true)}{e.lieu && ` · ${e.lieu}`}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {dernieresAnnonces.length > 0 && (
            <section className="reveal" style={{ ['--i' as string]: 7 }}>
              <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-3">Dernières annonces</h2>
              <div className="space-y-3">
                {dernieresAnnonces.map((a) => (
                  <Link key={a.id} href="/annonces" className="card-lift block bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4">
                    <p className="font-semibold text-sm text-anareka-vert">{a.epingle && '📌 '}{a.titre}</p>
                    <p className="text-xs text-anareka-gris mt-1 line-clamp-2">{a.contenu}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
