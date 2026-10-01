import Link from 'next/link'
import { EnTete, Vide, dateFR } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'
import { listerFormations } from '@/services/contenu'

export default async function FormationsPage() {
  await exigerMembre()
  const formations = listerFormations()

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTete surtitre="Association" titre="Formations" />
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        {formations.length === 0 && <Vide>Aucune formation pour le moment.</Vide>}
        <div className="space-y-4">
          {formations.map((f) => (
            <Link
              key={f.id}
              href={`/formations/${f.id}`}
              className="group block bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure border-l-4 border-l-anareka-vert shadow-anareka p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-anareka-hov hover:border-l-anareka-or"
            >
              <h2 className="font-serif text-xl font-semibold text-anareka-vert">{f.titre}</h2>
              {f.description && <p className="text-sm text-anareka-gris mt-1 line-clamp-2">{f.description}</p>}
              <p className="text-xs text-anareka-gris mt-3 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-anareka-or" />
                {f.date_debut ? dateFR(f.date_debut) : 'Date à définir'}
                {f.lieu && ` · ${f.lieu}`}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
