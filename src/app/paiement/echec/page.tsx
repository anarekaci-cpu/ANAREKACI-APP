import Link from 'next/link'

export default function PaiementEchec() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-anareka-ivoire px-4">
      <div className="text-center max-w-sm">
        <h1 className="font-serif text-2xl font-bold text-red-600 mb-2">Paiement échoué</h1>
        <p className="text-sm text-anareka-gris mb-4">Une erreur s&apos;est produite. Veuillez réessayer.</p>
        <Link href="/cotisations" className="text-anareka-vert font-semibold underline hover:text-anareka-terre">Retour aux cotisations</Link>
      </div>
    </main>
  )
}
