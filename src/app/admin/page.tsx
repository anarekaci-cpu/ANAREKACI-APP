import Link from 'next/link'
import CountUp from '@/components/CountUp'
import { MOIS_NOMS, aPermission, formatFCFA, type Permission } from '@/config/association'
import { exigerAccesAdmin } from '@/lib/auth/dal'
import { statistiquesGlobales } from '@/services/stats'

const SECTIONS: { href: string; titre: string; desc: string; permission: Permission; badge?: 'droits' | 'paiements' | 'membres' }[] = [
  { href: '/admin/membres', titre: 'Membres', desc: 'Valider, suspendre, réinitialiser un mot de passe', permission: 'membres', badge: 'membres' },
  { href: '/admin/droits-inscription', titre: "Droits d'inscription", desc: "Valider les adhésions déclarées", permission: 'paiements', badge: 'droits' },
  { href: '/admin/paiements-cotisations', titre: 'Paiements à valider', desc: 'Cotisations déclarées par les membres', permission: 'paiements', badge: 'paiements' },
  { href: '/admin/cotisations', titre: 'Suivi des cotisations', desc: 'Tableau mois par mois', permission: 'paiements' },
  { href: '/admin/annonces', titre: 'Annonces', desc: 'Créer et publier', permission: 'contenu' },
  { href: '/admin/formations', titre: 'Formations', desc: 'Créer et suivre les inscrits', permission: 'contenu' },
  { href: '/admin/evenements', titre: 'Événements', desc: 'Réunions, assemblées…', permission: 'contenu' },
  { href: '/admin/roles', titre: 'Rôles', desc: 'Attribuer trésorier, secrétaire, bureau…', permission: 'membres' },
  { href: '/admin/rapports', titre: 'Rapports financiers', desc: 'Encaissements par mois', permission: 'rapports' },
  { href: '/admin/statistiques', titre: 'Statistiques', desc: "Vue d'ensemble de l'association", permission: 'rapports' },
]

export default async function AdminPage() {
  const membre = await exigerAccesAdmin()
  const stats = statistiquesGlobales()
  const visibles = SECTIONS.filter((s) => aPermission(membre.role, s.permission))
  const aTraiter = (aPermission(membre.role, 'paiements') ? stats.aTraiter.droits + stats.aTraiter.paiements : 0) + (aPermission(membre.role, 'membres') ? stats.membres.enAttente : 0)

  const compteurs = { droits: stats.aTraiter.droits, paiements: stats.aTraiter.paiements, membres: stats.membres.enAttente }
  const max = Math.max(1, ...stats.parMois.map((m) => m.total))
  const kpis: [string, number, string][] = [
    ['Membres actifs', stats.membres.actifs, ''],
    ['En attente', stats.membres.enAttente, ''],
    ['Recouvrement', stats.cotisations.tauxRecouvrement, '%'],
    ['Encaissé (F)', stats.encaisse.total, ''],
  ]

  return (
    <main className="min-h-dvh bg-anareka-noir text-white">
      <header className="hero-aurora border-b-2 border-anareka-or">
        <div className="hero-pattern absolute inset-0 opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <span className="reveal text-[10px] font-semibold uppercase tracking-[0.25em] text-anareka-or-clair">Espace de gestion · {membre.nom_complet}</span>
          <h1 className="reveal font-serif text-3xl font-bold mt-1" style={{ ['--i' as string]: 1 }}>Administration ANAREKA-CI</h1>
          <p className="reveal text-xs text-anareka-or-clair/90 mt-2" style={{ ['--i' as string]: 2 }}>
            {aTraiter > 0 ? `🔔 ${aTraiter} élément${aTraiter > 1 ? 's' : ''} à traiter` : '✓ Rien en attente'}
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map(([titre, v, suf], i) => (
            <div key={titre} className="reveal glass card-lift rounded-anareka-lg p-4" style={{ ['--i' as string]: i }}>
              <p className="text-[10px] uppercase tracking-wider text-anareka-or-clair/80">{titre}</p>
              <p className="font-serif text-3xl font-bold mt-1"><CountUp valeur={v} suffixe={suf} /></p>
            </div>
          ))}
        </div>

        {aPermission(membre.role, 'rapports') && (
          <section className="reveal glass rounded-anareka-lg p-5" style={{ ['--i' as string]: 4 }}>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold">Encaissements {stats.cotisations.annee}</h2>
              <span className="text-xs text-anareka-or-clair">{formatFCFA(stats.encaisse.total)}</span>
            </div>
            <div className="flex items-end gap-1.5 h-32">
              {stats.parMois.map((m, i) => (
                <div key={m.mois} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${MOIS_NOMS[m.mois - 1]} : ${formatFCFA(m.total)}`}>
                  <div className="bar-grow w-full rounded-t bg-gradient-to-t from-anareka-or to-anareka-or-clair" style={{ height: `${Math.max(m.total ? 6 : 2, (m.total / max) * 100)}%`, opacity: m.total ? 1 : 0.25, ['--i' as string]: i }} />
                  <span className="text-[9px] text-white/50">{MOIS_NOMS[m.mois - 1].slice(0, 1)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibles.map((s, i) => {
            const n = s.badge ? compteurs[s.badge] : 0
            return (
              <Link
                key={s.href}
                href={s.href}
                style={{ ['--i' as string]: i + 5 }}
                className="reveal card-lift relative block bg-anareka-vert-med border border-anareka-vert-clair/30 rounded-anareka-lg p-6 hover:border-anareka-or hover:shadow-anareka-or"
              >
                {n > 0 && <span className="absolute top-4 right-4 bg-anareka-or text-anareka-noir text-xs font-bold rounded-full min-w-6 h-6 px-2 inline-flex items-center justify-center animate-btn-pulse">{n}</span>}
                <div className="font-serif text-xl font-bold mb-2">{s.titre}</div>
                <div className="text-xs text-anareka-or-clair/80">{s.desc}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
