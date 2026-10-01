import Link from 'next/link'
import { redirect } from 'next/navigation'
import CarteMembre from '@/components/CarteMembre'
import CountUp from '@/components/CountUp'
import Icone, { type NomIcone } from '@/components/Icones'
import Pagne from '@/components/Pagne'
import { Badge, Flash, dateFR } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { resumeCotisations } from '@/services/cotisations'
import { droitDuMembre } from '@/services/droits'
import { annoncesPubliees, listerEvenements } from '@/services/contenu'
import { compterNonLues } from '@/services/notifications'
import { ROLE_LABELS, TARIFS, aAccesAdmin, formatFCFA } from '@/config/association'

function salut(): string {
  const h = Number(new Date().toLocaleString('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Africa/Abidjan' }))
  return h < 5 ? 'Bonsoir' : h < 18 ? 'Bonjour' : 'Bonsoir'
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
  const annonce = annoncesPubliees()[0]
  const prochain = listerEvenements().find((e) => e.date_debut >= new Date().toISOString())

  const raccourcis: { href: string; titre: string; icone: NomIcone }[] = [
    { href: '/paiements', titre: 'Mes paiements', icone: 'paiements' },
    { href: '/formations', titre: 'Formations', icone: 'formations' },
    { href: '/messages', titre: 'Messages', icone: 'messages' },
    { href: '/profil', titre: 'Mon profil', icone: 'profil' },
  ]

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <Flash erreur={erreur} succes={succes} />

      <header className="reveal">
        <p className="text-anareka-gris font-semibold">{salut()},</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold leading-[1.02]">{membre.prenoms}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {estActif ? <Badge ton="vert">Membre actif</Badge> : <Badge ton="or">En attente de validation</Badge>}
          <span className="text-sm text-anareka-gris">{ROLE_LABELS[membre.role]}</span>
        </div>
      </header>

      <div className="reveal" style={{ ['--i' as string]: 1 }}>
        <CarteMembre nom={membre.nom_complet} numero={membre.numero_membre} depuis={dateFR(membre.cree_le)} role={ROLE_LABELS[membre.role]} actif={estActif} />
      </div>

      {/* Mon pagne */}
      <section className="sr rounded-[28px] border border-anareka-bordure bg-anareka-attieke p-5 sm:p-6" aria-labelledby="titre-pagne">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <h2 id="titre-pagne" className="font-serif text-2xl font-extrabold">Mon pagne {annee}</h2>
            <p className="text-anareka-gris text-sm mt-0.5"><CountUp valeur={resume.nbPayes} /> carreau{resume.nbPayes > 1 ? 'x' : ''} tissé{resume.nbPayes > 1 ? 's' : ''} sur 12</p>
          </div>
          <Link href="/cotisations" className="btn btn-shine shrink-0 whitespace-nowrap bg-anareka-or text-anareka-noir px-4 py-2.5 text-sm shadow-anareka-or">
            <Icone nom="tisser" taille={18} /> Cotiser
          </Link>
        </div>
        <Pagne annee={annee} mois={resume.grille.map((l) => l.statut)} />
        <p className="mt-4 text-sm text-anareka-gris">
          Reste à payer : <strong className="text-anareka-noir"><CountUp valeur={resume.resteAPayer} suffixe=" F" /></strong>
        </p>
      </section>

      {/* Bento */}
      <section className="grid grid-cols-2 gap-3" aria-label="À la une">
        <Link href="/annonces" className="sr card-lift col-span-2 flex gap-4 items-start rounded-[24px] bg-anareka-terre text-white p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-anareka-or text-anareka-noir"><Icone nom="annonces" /></span>
          <span className="min-w-0">
            <span className="block text-sm text-white/60">{annonce ? 'Dernière annonce' : 'Annonces'}</span>
            <span className="block font-serif text-lg font-bold leading-snug">{annonce ? annonce.titre : 'Aucune annonce pour le moment'}</span>
            {annonce && <span className="block text-sm text-white/70 mt-1 line-clamp-2">{annonce.contenu}</span>}
          </span>
        </Link>

        <Link href="/evenements" className="sr card-lift rounded-[24px] bg-white border border-anareka-bordure p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-anareka-vert-pale text-anareka-vert"><Icone nom="evenements" /></span>
          <span className="block font-serif font-bold mt-3 leading-snug">{prochain ? prochain.titre : 'Événements'}</span>
          <span className="block text-sm text-anareka-gris mt-0.5">{prochain ? dateFR(prochain.date_debut) : 'Rien de prévu pour l’instant'}</span>
        </Link>

        <Link href="/notifications" className="sr card-lift rounded-[24px] bg-white border border-anareka-bordure p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-anareka-or-pale text-anareka-terre"><Icone nom="alertes" /></span>
          <span className="block font-serif text-3xl font-extrabold mt-3 leading-none"><CountUp valeur={nonLues} /></span>
          <span className="block text-sm text-anareka-gris mt-0.5">alerte{nonLues > 1 ? 's' : ''} non lue{nonLues > 1 ? 's' : ''}</span>
        </Link>

        {raccourcis.map((c) => (
          <Link key={c.href} href={c.href} className="sr card-lift flex items-center gap-3 rounded-[22px] bg-white border border-anareka-bordure px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-anareka-gris-clair text-anareka-vert"><Icone nom={c.icone} taille={20} /></span>
            <span className="font-bold text-sm">{c.titre}</span>
          </Link>
        ))}
      </section>
      <p className="text-center text-xs text-anareka-gris">Cotisation mensuelle : {formatFCFA(TARIFS.cotisationMensuelle).replace(/ /g, ' ')}</p>
    </main>
  )
}
