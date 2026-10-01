import Logo from '@/components/Logo'
import CarteMembrePdf from '@/components/CarteMembrePdf'
import { EnTete, dateFR } from '@/components/ui'
import { ASSOCIATION, ROLE_LABELS } from '@/config/association'
import { exigerMembre } from '@/lib/auth/dal'

export default async function CartePage() {
  const m = await exigerMembre()
  const actif = m.statut === 'actif'

  return (
    <main className="min-h-dvh bg-anareka-ivoire">
      <EnTete surtitre="Mon compte" titre="Ma carte de membre" retour={{ href: '/dashboard', label: 'Tableau de bord' }} />
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center gap-8">
        <div className="reveal card-membre relative w-full max-w-md aspect-[85.6/54] rounded-2xl overflow-hidden shadow-anareka-hov text-white p-6 hero-aurora border border-anareka-or/40">
          <div className="hero-pattern absolute inset-0 opacity-60" />
          <div className="card-membre__shine" />
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-serif text-2xl font-bold text-anareka-or-clair leading-none">{ASSOCIATION.sigle}</p>
                <p className="text-[9px] uppercase tracking-[0.3em] mt-1.5 text-white/70">Carte de membre</p>
              </div>
              <Logo taille={56} />
            </div>
            <div>
              <p className="font-mono text-lg tracking-[0.15em] text-anareka-or-clair">{m.numero_membre}</p>
              <p className="font-semibold uppercase tracking-wide mt-1 truncate">{m.nom_complet}</p>
              <div className="flex justify-between items-end text-[10px] text-white/70 mt-1">
                <span>Depuis {dateFR(m.cree_le)} · {ROLE_LABELS[m.role]}</span>
                <span className={`px-2 py-0.5 rounded-full font-semibold uppercase ${actif ? 'bg-anareka-or text-anareka-noir' : 'bg-white/20'}`}>{actif ? 'Actif' : 'En attente'}</span>
              </div>
            </div>
          </div>
        </div>
        <CarteMembrePdf nom={m.nom_complet} numeroMembre={m.numero_membre} depuis={m.cree_le} role={ROLE_LABELS[m.role]} />
      </div>
    </main>
  )
}
