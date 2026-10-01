import CarteMembre from '@/components/CarteMembre'
import CarteMembrePdf from '@/components/CarteMembrePdf'
import { EnTete, dateFR } from '@/components/ui'
import { ROLE_LABELS } from '@/config/association'
import { exigerMembre } from '@/lib/auth/dal'

export default async function CartePage() {
  const m = await exigerMembre()

  return (
    <main className="min-h-dvh">
      <EnTete titre="Ma carte" retour={{ href: '/dashboard', label: 'Accueil' }} />
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center gap-8">
        <div className="reveal w-full" style={{ ['--i' as string]: 2 }}>
          <CarteMembre nom={m.nom_complet} numero={m.numero_membre} depuis={dateFR(m.cree_le)} role={ROLE_LABELS[m.role]} actif={m.statut === 'actif'} />
        </div>
        <CarteMembrePdf nom={m.nom_complet} numeroMembre={m.numero_membre} depuis={m.cree_le} role={ROLE_LABELS[m.role]} />
      </div>
    </main>
  )
}
