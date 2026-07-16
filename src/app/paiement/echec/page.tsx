export default function PaiementEchec() {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">Paiement échoué</h1>
      <p>Une erreur s&apos;est produite. Veuillez réessayer.</p>
      <a href="/cotisations" className="text-anareka-or underline">Retour aux cotisations</a>
    </main>
  );
}