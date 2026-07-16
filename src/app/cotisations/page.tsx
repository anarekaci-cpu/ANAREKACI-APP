'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createCinetPayConfig, initierPaiement } from '@/lib/cinetpay'

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export default function CotisationsPage() {
  const router = useRouter()
  const [membre, setMembre] = useState<any>(null)
  const [droit, setDroit] = useState<any>(null)
  const [cotisations, setCotisations] = useState<any[]>([])
  const [loadingPaiement, setLoadingPaiement] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    async function chargerDonnees() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: membreData } = await supabase
        .from('membres')
        .select('*')
        .eq('compte_id', user.id)
        .single()

      if (!membreData) {
        router.push('/attente-validation')
        return
      }
      setMembre(membreData)

      const { data: droitData } = await supabase
        .from('droits_inscription')
        .select('*')
        .eq('membre_id', membreData.id)
        .single()
      setDroit(droitData)

      if (droitData?.statut !== 'paye') {
        router.push('/droit-inscription')
        return
      }

      const currentYear = new Date().getFullYear()
      const { data: cotisationsData } = await supabase
        .from('cotisations')
        .select('*')
        .eq('membre_id', membreData.id)
        .eq('annee', currentYear)
        .order('mois', { ascending: true })
      setCotisations(cotisationsData || [])
      setChargement(false)
    }

    chargerDonnees()
  }, [router])

  const handlePaiementTest = async (mois: number) => {
    setLoadingPaiement(`mois-${mois}`)
    setMessage('')

    const config = createCinetPayConfig(window.location.origin)
    const transactionId = `cot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const result = await initierPaiement(config, {
      transactionId,
      amount: 1000,
      customerName: membre?.nom_complet || 'Membre',
      customerPhone: membre?.telephone || '',
      description: `Cotisation ${MOIS_NOMS[mois - 1]} 2025`,
      metadata: { membre_id: membre?.id, mois, annee: 2025, type: 'cotisation' }
    })

    setLoadingPaiement(null)

    if (result.success && result.paymentUrl) {
      // Enregistrer le paiement en attente dans la base
      const supabase = createClient()
      await supabase.from('paiements').insert({
        membre_id: membre.id,
        type: 'cotisation',
        montant: 1000,
        methode: 'mobile_money',
        reference: transactionId,
        statut: 'en_attente',
        date_paiement: new Date().toISOString()
      })

      window.location.href = result.paymentUrl
    } else {
      setMessage(result.message || 'Erreur lors du paiement')
    }
  }

  if (chargement) {
    return (
      <main className="min-h-screen bg-anareka-ivoire flex items-center justify-center">
        <p className="text-anareka-gris">Chargement...</p>
      </main>
    )
  }

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const moisPayes = cotisations.filter(c => c.statut === 'paye').length
  const moisNonPayes = cotisations.filter(c => c.statut === 'non_paye').length
  const totalVerse = cotisations.reduce((sum, c) => sum + (c.statut === 'paye' ? c.montant : 0), 0)
  const montantMensuel = 1000
  const moisEnRetard = cotisations.filter(c => c.statut === 'non_paye' && c.mois < currentMonth)

  return (
    <main className="min-h-screen bg-anareka-ivoire">
      <header className="bg-anareka-vert border-b border-anareka-or/25">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-anareka-or">Membre</span>
          <h1 className="font-serif text-3xl font-bold text-white mt-1">Mes Cotisations</h1>
          <div className="w-12 h-0.5 bg-anareka-or mt-3" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-up">
        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Mois payés</p>
            <p className="text-3xl font-bold text-anareka-vert">{moisPayes}/12</p>
          </div>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Total versé</p>
            <p className="text-3xl font-bold text-anareka-vert">{totalVerse.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
          </div>
          <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka p-5">
            <p className="text-xs text-anareka-gris uppercase tracking-wide mb-1">Cotisation mensuelle</p>
            <p className="text-3xl font-bold text-anareka-vert">{montantMensuel.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
          </div>
        </div>

        {/* Alerte test CinetPay */}
        {message && (
          <div className="bg-red-50 border border-red-200 rounded-anareka p-4 mb-6">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        {/* Alertes retard */}
        {moisEnRetard.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-anareka p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚠️</span>
              <h3 className="font-semibold text-red-700">Paiements en retard</h3>
            </div>
            <p className="text-sm text-red-700">
              Vous avez {moisEnRetard.length} mois en retard de paiement.
            </p>
          </div>
        )}

        {/* Liste des mois */}
        <div className="bg-anareka-blanc rounded-anareka-lg border border-anareka-bordure shadow-anareka overflow-hidden">
          <div className="px-6 py-4 border-b border-anareka-bordure">
            <h2 className="font-serif text-xl font-semibold text-anareka-vert">Cotisations {currentYear}</h2>
          </div>
          
          <div className="divide-y divide-anareka-bordure">
            {cotisations.map((cotisation) => {
              const isPast = cotisation.mois < currentMonth
              const isCurrent = cotisation.mois === currentMonth
              const isFuture = cotisation.mois > currentMonth
              const isLoadingThis = loadingPaiement === `mois-${cotisation.mois}`
              
              return (
                <div key={cotisation.id} className="px-6 py-4 flex items-center justify-between hover:bg-anareka-ivoire transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      cotisation.statut === 'paye' ? 'bg-anareka-vert' : 
                      isPast ? 'bg-red-500' : 
                      isCurrent ? 'bg-anareka-or' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="font-medium text-anareka-noir">{MOIS_NOMS[cotisation.mois - 1]}</p>
                      <p className="text-xs text-anareka-gris">
                        {isPast && cotisation.statut === 'non_paye' && 'En retard'}
                        {isCurrent && 'Mois en cours'}
                        {isFuture && 'À venir'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {cotisation.statut === 'paye' ? (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-anareka-vert">Payé</p>
                        {cotisation.date_paiement && (
                          <p className="text-xs text-anareka-gris">
                            {new Date(cotisation.date_paiement).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePaiementTest(cotisation.mois)}
                        disabled={isLoadingThis}
                        className="text-xs font-semibold uppercase tracking-wide bg-anareka-vert text-white px-4 py-2 rounded-anareka hover:bg-anareka-vert-clair transition-colors disabled:opacity-50"
                      >
                        {isLoadingThis ? 'Redirection...' : `Payer (${montantMensuel.toLocaleString('fr-FR')} F)`}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bouton payer plusieurs mois */}
        {moisNonPayes > 0 && (
          <div className="mt-6 text-center">
            <Link
              href="/cotisations/payer-multiple"
              className="inline-block bg-anareka-or text-white font-semibold text-sm uppercase tracking-wide rounded-anareka px-6 py-3 hover:bg-anareka-or-clair transition-colors shadow-anareka"
            >
              Payer plusieurs mois d&apos;un coup
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}