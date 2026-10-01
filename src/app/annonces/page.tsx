import { Badge, Vide, dateFR } from '@/components/ui'
import { exigerMembre } from '@/lib/auth/dal'
import { annoncesPubliees } from '@/services/contenu'

export default async function AnnoncesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await exigerMembre()
  const { q } = await searchParams
  const terme = q?.trim().toLowerCase()
  const annonces = annoncesPubliees().filter((a) => !terme || `${a.titre} ${a.contenu}`.toLowerCase().includes(terme))

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">
        <div className="mb-8">
          <span className="text-[10px] font-semibold text-anareka-or">Association</span>
          <h1 className="font-serif text-3xl font-bold text-anareka-vert mt-1">Annonces</h1>
          <div className="w-12 h-0.5 bg-anareka-or mt-3" />
        </div>

        <form className="mb-6 flex gap-2">
          <input name="q" defaultValue={q} placeholder="Rechercher une annonce…" className="w-full bg-white border border-anareka-bordure rounded-anareka px-4 py-2.5 text-sm focus:outline-none focus:border-anareka-or focus:ring-2 focus:ring-anareka-or/20" />
          <button className="bg-anareka-vert text-white text-xs font-semibold px-5 rounded-anareka hover:bg-anareka-vert-clair transition-colors">Chercher</button>
        </form>

        {annonces.length === 0 && (
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka">
            <Vide>{terme ? 'Aucune annonce ne correspond à votre recherche.' : 'Aucune annonce pour le moment.'}</Vide>
          </div>
        )}

        <div className="space-y-4">
          {annonces.map((a, i) => (
            <article
              key={a.id}
              style={{ ['--i' as string]: i }}
              className={`bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-6 reveal card-lift border-l-4 ${a.epingle ? 'border-l-anareka-or' : 'border-l-transparent'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-serif text-xl font-semibold text-anareka-vert">{a.titre}</h2>
                {a.epingle && <Badge ton="or">Épinglé</Badge>}
              </div>
              <p className="text-anareka-noir/80 mt-2 whitespace-pre-wrap leading-relaxed">{a.contenu}</p>
              {a.publie_le && (
                <p className="text-xs text-anareka-gris mt-4 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-anareka-or" />
                  {dateFR(a.publie_le)}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
