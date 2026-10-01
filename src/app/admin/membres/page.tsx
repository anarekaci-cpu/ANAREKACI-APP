import Link from 'next/link'
import { cookies } from 'next/headers'
import ExportButton from '@/components/ExportButton'
import { Badge, EnTeteAdmin, Flash, Vide, boutonPetitCls, champCls } from '@/components/ui'
import { ROLE_LABELS } from '@/config/association'
import { exigerPermission } from '@/lib/auth/dal'
import type { FlashParams } from '@/lib/flash'
import { listerMembres } from '@/services/membres'
import { changerStatut, reinitialiserMotDePasse } from './actions'
import { COOKIE_RESET } from './constantes'

export default async function AdminMembresPage({ searchParams }: { searchParams: Promise<Awaited<FlashParams> & { recherche?: string }> }) {
  const { recherche, erreur, succes } = await searchParams
  await exigerPermission('membres')

  const terme = recherche?.trim().toLowerCase()
  const membres = listerMembres().filter(
    (m) => !terme || [m.nom_complet, m.telephone, m.numero_membre, m.commune_quartier ?? ''].some((v) => v.toLowerCase().includes(terme))
  )

  // Mot de passe temporaire généré à l'instant (cookie httpOnly de 60 s)
  const brut = (await cookies()).get(COOKIE_RESET)?.value
  let reset: { nom: string; motDePasse: string } | null = null
  try {
    reset = brut ? JSON.parse(decodeURIComponent(brut)) : null
  } catch {
    reset = null
  }

  const actions = (m: (typeof membres)[number]) => (
    <div className="flex gap-2 flex-wrap">
                            {m.statut !== 'actif' && (
                              <form action={changerStatut}>
                                <input type="hidden" name="membreId" value={m.id} />
                                <input type="hidden" name="statut" value="actif" />
                                <button className={`${boutonPetitCls} bg-anareka-vert text-white hover:bg-anareka-vert-clair`}>{m.statut === 'suspendu' ? 'Réactiver' : 'Valider'}</button>
                              </form>
                            )}
                            {m.statut !== 'suspendu' && (
                              <form action={changerStatut}>
                                <input type="hidden" name="membreId" value={m.id} />
                                <input type="hidden" name="statut" value="suspendu" />
                                <button className={`${boutonPetitCls} bg-red-100 text-red-700 hover:bg-red-200`}>Suspendre</button>
                              </form>
                            )}
                            <form action={reinitialiserMotDePasse}>
                              <input type="hidden" name="membreId" value={m.id} />
                              <button className={`${boutonPetitCls} bg-anareka-or text-white hover:bg-anareka-or-clair`}>Réinit. mot de passe</button>
                            </form>
                          </div>
  )

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTeteAdmin titre="Gestion des membres" />
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8 animate-fade-up">
        <Flash erreur={erreur} succes={succes} />

        {reset && (
          <div className="bg-green-50 border border-green-200 rounded-anareka p-4 mb-4" role="status">
            <h2 className="font-semibold text-green-700">Mot de passe réinitialisé pour {reset.nom}</h2>
            <p className="text-sm text-green-800 mt-1">
              Communiquez-lui ce mot de passe temporaire : <code className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-green-200">{reset.motDePasse}</code>
            </p>
            <p className="text-xs text-green-700 mt-1">Il ne sera plus affiché après 1 minute. Le membre peut le changer dans « Profil ».</p>
          </div>
        )}

        <form className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-3 sm:p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <input name="recherche" defaultValue={recherche} placeholder="Nom, téléphone, n° de membre, commune…" className={champCls} />
          <button className="bg-anareka-vert text-white text-xs font-semibold uppercase tracking-wide px-6 h-12 sm:h-auto rounded-anareka hover:bg-anareka-vert-clair transition-colors">Rechercher</button>
          {recherche && (
            <Link href="/admin/membres" className="text-xs font-semibold uppercase text-anareka-gris self-center">Effacer</Link>
          )}
        </form>

        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-hidden">
          <div className="px-4 sm:px-4 sm:px-6 py-4 border-b border-anareka-bordure flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-anareka-vert">{membres.length} membre{membres.length > 1 ? 's' : ''}</h2>
            <ExportButton
              filename="membres_anareka"
              label="Exporter Excel"
              data={membres.map((m) => ({
                'N° membre': m.numero_membre,
                Nom: m.nom,
                Prénoms: m.prenoms,
                Téléphone: m.telephone,
                Sexe: m.sexe,
                Commune: m.commune_quartier,
                Activité: m.type_activite,
                Statut: m.statut,
                Rôle: m.role,
                Inscription: m.cree_le.slice(0, 10),
              }))}
            />
          </div>

          {membres.length === 0 ? (
            <Vide>Aucun membre trouvé.</Vide>
          ) : (
            <>
            <ul className="md:hidden divide-y divide-anareka-bordure">
              {membres.map((m) => (
                <li key={m.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/admin/membres/${m.id}`} className="font-semibold text-anareka-vert block truncate">{m.nom_complet}</Link>
                      <p className="text-xs text-anareka-gris font-mono">{m.numero_membre}</p>
                    </div>
                    <Badge ton={m.statut === 'actif' ? 'vert' : m.statut === 'suspendu' ? 'rouge' : 'or'}>{m.statut === 'en_attente' ? 'en attente' : m.statut}</Badge>
                  </div>
                  <p className="text-sm text-anareka-noir/80">
                    <a href={`tel:${m.telephone}`} className="underline">{m.telephone}</a>
                    {m.commune_quartier ? ` · ${m.commune_quartier}` : ''}
                    {m.role !== 'membre' && <span className="ml-2"><Badge ton="or">{ROLE_LABELS[m.role]}</Badge></span>}
                  </p>
                  {actions(m)}
                </li>
              ))}
            </ul>
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-anareka-vert-pale text-anareka-vert text-left">
                <tr>
                  {['Nom', 'N°', 'Téléphone', 'Commune', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-anareka-bordure">
                {membres.map((m) => (
                  <tr key={m.id} className="hover:bg-anareka-ivoire transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/admin/membres/${m.id}`} className="text-anareka-vert hover:text-anareka-or">{m.nom_complet}</Link>
                      {m.role !== 'membre' && <span className="ml-2"><Badge ton="or">{ROLE_LABELS[m.role]}</Badge></span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-anareka-noir/70">{m.numero_membre}</td>
                    <td className="px-4 py-3">{m.telephone}</td>
                    <td className="px-4 py-3">{m.commune_quartier ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge ton={m.statut === 'actif' ? 'vert' : m.statut === 'suspendu' ? 'rouge' : 'or'}>{m.statut === 'en_attente' ? 'en attente' : m.statut}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {actions(m)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
