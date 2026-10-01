import { Badge, EnTete, Vide, dateFR } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'
import { listerEvenements } from '@/services/contenu'

export default async function EvenementsPage() {
  await exigerMembre()
  const maintenant = new Date().toISOString()
  const tous = listerEvenements()
  const avenir = tous.filter((e) => (e.date_fin ?? e.date_debut) >= maintenant)
  const passes = tous.filter((e) => (e.date_fin ?? e.date_debut) < maintenant).reverse().slice(0, 5)

  const bloc = (titre: string, liste: typeof tous) => (
    <section>
      <h2 className="font-serif text-lg font-semibold text-anareka-vert mb-3">{titre}</h2>
      {liste.length === 0 ? <Vide>Aucun événement.</Vide> : (
        <ul className="space-y-3">
          {liste.map((e) => (
            <li key={e.id} className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-l-4 border-l-anareka-or shadow-anareka p-5">
              <p className="font-serif text-lg font-semibold text-anareka-vert">{e.titre} <Badge ton="or">{e.type}</Badge></p>
              <p className="text-xs text-anareka-gris mt-1">{dateFR(e.date_debut, true)}{e.lieu && ` · ${e.lieu}`}</p>
              {e.description && <p className="text-sm text-anareka-noir/80 mt-2 whitespace-pre-wrap">{e.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTete surtitre="Association" titre="Événements" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-up">
        {bloc('À venir', avenir)}
        {passes.length > 0 && bloc('Récents', passes)}
      </div>
    </main>
  )
}
