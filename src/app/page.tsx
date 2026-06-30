import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">ANAREKA-CI</h1>
        <Link href="/login" className="text-blue-600 underline">
          Accéder à l'espace membres
        </Link>
      </div>
    </main>
  )
}