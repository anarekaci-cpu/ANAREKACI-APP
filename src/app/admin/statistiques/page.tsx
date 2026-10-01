import { EnTeteAdmin } from '@/components/ui'
import { formatFCFA } from '@/config/association'
import { exigerPermission } from '@/lib/auth/dal'
import { statistiquesGlobales } from '@/services/stats'

export default async function AdminStatistiquesPage() {
  await exigerPermission('rapports')
  const s = statistiquesGlobales()

  const cartes: [string, string | number, string?][] = [
    ['Membres', s.membres.total],
    ['Actifs', s.membres.actifs, 'text-anareka-vert'],
    ['En attente', s.membres.enAttente, 'text-anareka-or'],
    ['Suspendus', s.membres.suspendus, 'text-red-600'],
    ['Droits à valider', s.aTraiter.droits, 'text-anareka-or'],
    ['Paiements à valider', s.aTraiter.paiements, 'text-anareka-or'],
    [`Recouvrement ${s.cotisations.annee}`, `${s.cotisations.tauxRecouvrement}%`, 'text-anareka-vert'],
    ['Total encaissé', formatFCFA(s.encaisse.total), 'text-anareka-vert'],
  ]
  const maxCommune = Math.max(1, ...s.communes.map(([, n]) => n))

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre="Statistiques" />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cartes.map(([titre, valeur, cls]) => (
            <div key={titre} className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-4">
              <p className="text-[11px] uppercase tracking-wide text-anareka-gris">{titre}</p>
              <p className={`text-2xl font-bold mt-1 ${cls ?? 'text-anareka-noir'}`}>{valeur}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <section className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
            <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-3">Répartition par sexe</h2>
            <p className="text-sm">Femmes : <strong>{s.membres.femmes}</strong> · Hommes : <strong>{s.membres.hommes}</strong></p>
          </section>
          <section className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6">
            <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-3">Par commune / quartier</h2>
            <ul className="space-y-2 text-sm">
              {s.communes.length === 0 && <li className="text-anareka-gris">Aucune donnée.</li>}
              {s.communes.slice(0, 8).map(([nom, n]) => (
                <li key={nom}>
                  <div className="flex justify-between"><span>{nom}</span><span className="font-semibold">{n}</span></div>
                  <div className="h-1.5 bg-anareka-vert-pale rounded-full mt-1"><div className="h-1.5 bg-anareka-vert rounded-full" style={{ width: `${(n / maxCommune) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
