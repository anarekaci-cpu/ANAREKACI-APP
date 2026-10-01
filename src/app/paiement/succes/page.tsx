import Link from 'next/link'

export default function PaiementSucces() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-anareka-ivoire px-4">
      <div className="text-center max-w-sm">
        <h1 className="font-serif text-2xl font-bold text-anareka-vert mb-2">Paiement reçu ✓</h1>
        <p className="text-sm text-anareka-gris mb-4">Merci. Votre compte sera mis à jour dès confirmation du paiement.</p>
        <Link href="/dashboard" className="text-anareka-vert font-semibold underline hover:text-anareka-or">Retour au tableau de bord</Link>
      </div>
    </main>
  )
}
