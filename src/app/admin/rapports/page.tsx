import ExportButton from '@/components/ExportButton'
import { Carte, EnTeteAdmin } from '@/components/ui'
import { MOIS_NOMS, formatFCFA } from '@/config/association'
import { exigerPermission } from '@/lib/auth/dal'
import { listerPaiements } from '@/services/paiements'
import { statistiquesGlobales } from '@/services/stats'

export default async function AdminRapportsPage() {
  await exigerPermission('rapports')
  const s = statistiquesGlobales()
  const max = Math.max(1, ...s.parMois.map((m) => m.total))
  const valides = listerPaiements({ statut: 'valide' })

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre={`Rapport financier ${s.cotisations.annee}`} />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[['Total encaissé', s.encaisse.total], ["Droits d'inscription", s.encaisse.droits], ['Cotisations', s.encaisse.cotisations]].map(([t, v]) => (
            <div key={t} className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-4">
              <p className="text-xs text-anareka-gris">{t}</p>
              <p className="text-xl font-bold text-anareka-vert mt-1">{formatFCFA(Number(v))}</p>
            </div>
          ))}
        </div>

        <Carte>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-anareka-vert">Encaissements par mois (date de validation)</h2>
            <ExportButton
              filename="paiements_anareka"
              label="Exporter les paiements"
              data={valides.map((p) => ({
                Membre: p.membre?.nom_complet ?? '',
                'N° membre': p.membre?.numero_membre ?? '',
                Type: p.type,
                Mois: p.mois,
                Année: p.annee,
                Montant: p.montant,
                Méthode: p.methode,
                Référence: p.reference,
                Validé: p.date_validation?.slice(0, 10) ?? '',
              }))}
            />
          </div>
          <ul className="space-y-2 text-sm">
            {s.parMois.map((m) => (
              <li key={m.mois} className="grid grid-cols-[6rem_1fr_7rem] items-center gap-3">
                <span>{MOIS_NOMS[m.mois - 1]}</span>
                <div className="h-2 bg-anareka-vert-pale rounded-full"><div className="h-2 bg-anareka-vert rounded-full" style={{ width: `${(m.total / max) * 100}%` }} /></div>
                <span className="text-right font-semibold">{formatFCFA(m.total)}</span>
              </li>
            ))}
          </ul>
        </Carte>
      </div>
    </main>
  )
}
