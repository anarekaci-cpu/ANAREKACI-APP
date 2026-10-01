import Link from 'next/link'
import { EnTeteAdmin, Flash, Vide, boutonPetitCls } from '@/components/ui'
import { MOIS_NOMS, formatFCFA } from '@/config/association'
import { exigerPermission } from '@/lib/auth/dal'
import { lire } from '@/lib/db/store'
import { anneesDisponibles } from '@/services/cotisations'
import { envoyerRappels } from './actions'

export default async function AdminCotisationsPage({ searchParams }: { searchParams: Promise<{ annee?: string; erreur?: string; succes?: string }> }) {
  await exigerPermission('paiements')
  const { annee: param, erreur, succes } = await searchParams
  const annees = anneesDisponibles()
  const annee = annees.includes(Number(param)) ? Number(param) : annees[0]

  const db = lire()
  const actifs = db.membres.filter((m) => m.statut === 'actif').sort((a, b) => a.nom_complet.localeCompare(b.nom_complet))
  const lignes = actifs.map((m) => {
    const payes = new Set(db.cotisations.filter((c) => c.membre_id === m.id && c.annee === annee && c.statut === 'paye').map((c) => c.mois))
    const attente = new Set(db.paiements.filter((p) => p.membre_id === m.id && p.type === 'cotisation' && p.annee === annee && p.statut === 'en_attente').map((p) => p.mois))
    return { m, payes, attente }
  })
  const totalPayes = lignes.reduce((s, l) => s + l.payes.size, 0)
  const attendu = lignes.length * 12
  const encaisse = db.cotisations.filter((c) => c.annee === annee && c.statut === 'paye').reduce((s, c) => s + c.montant, 0)

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre={`Suivi des cotisations ${annee}`} />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />
        <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-2">
          {annees.map((a) => (
            <Link key={a} href={`/admin/cotisations?annee=${a}`} className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${a === annee ? 'bg-anareka-vert text-white border-anareka-vert' : 'bg-white text-anareka-vert border-anareka-bordure'}`}>
              {a}
            </Link>
          ))}
        </nav>
        {annee === new Date().getFullYear() && (
          <form action={envoyerRappels}>
            <input type="hidden" name="annee" value={annee} />
            <input type="hidden" name="mois" value={new Date().getMonth() + 1} />
            <button className={`${boutonPetitCls} bg-anareka-or text-white hover:bg-anareka-or-clair !px-4 !py-2 btn-shine`}>🔔 Rappeler les retardataires ({MOIS_NOMS[new Date().getMonth()]})</button>
          </form>
        )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4"><div className="text-2xl font-bold text-anareka-vert">{actifs.length}</div><div className="text-xs text-anareka-gris">membres actifs</div></div>
          <div className="bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4"><div className="text-2xl font-bold text-anareka-vert">{attendu ? Math.round((totalPayes / attendu) * 100) : 0}%</div><div className="text-xs text-anareka-gris">taux de recouvrement</div></div>
          <div className="bg-anareka-blanc rounded-anareka border border-anareka-bordure p-4"><div className="text-2xl font-bold text-anareka-vert">{formatFCFA(encaisse)}</div><div className="text-xs text-anareka-gris">encaissé</div></div>
        </div>

        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-x-auto">
          {lignes.length === 0 ? (
            <Vide>Aucun membre actif.</Vide>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-anareka-vert-pale text-anareka-vert">
                <tr>
                  <th className="sticky left-0 z-10 bg-anareka-vert-pale px-3 py-3 text-left font-semibold uppercase">Membre</th>
                  {MOIS_NOMS.map((n) => <th key={n} className="px-1.5 py-3 font-semibold" title={n}>{n.slice(0, 3)}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-anareka-bordure">
                {lignes.map(({ m, payes, attente }) => (
                  <tr key={m.id} className="hover:bg-anareka-ivoire">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium whitespace-nowrap">
                      <Link href={`/admin/membres/${m.id}`} className="text-anareka-vert hover:text-anareka-or">{m.nom_complet}</Link>
                    </td>
                    {MOIS_NOMS.map((n, i) => (
                      <td key={n} className="px-1.5 py-2 text-center" title={`${n} ${annee}`}>
                        {payes.has(i + 1) ? <span className="text-anareka-vert">✓</span> : attente.has(i + 1) ? <span>⏳</span> : <span className="text-anareka-gris/40">·</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-anareka-gris">✓ payé · ⏳ en attente de validation · · non payé</p>
      </div>
    </main>
  )
}
