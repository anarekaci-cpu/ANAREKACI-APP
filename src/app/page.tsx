import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-anareka-ivoire">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-anareka-vert mb-4">ANAREKA-CI</h1>
        <Link href="/login" className="text-anareka-vert font-semibold hover:text-anareka-or transition-colors">
          Accéder à l&apos;espace membres
        </Link>
      </div>
    </main>
  )
}