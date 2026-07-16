export default function PaiementSucces() {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold text-anareka-vert">Paiement réussi !</h1>
      <p>Merci pour votre paiement. Votre compte sera mis à jour sous peu.</p>
      <a href="/dashboard" className="text-anareka-or underline">Retour au tableau de bord</a>
    </main>
  );
}