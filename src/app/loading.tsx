export default function Loading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-4" aria-busy="true" aria-label="Chargement">
      <div className="skeleton h-28" />
      <div className="grid grid-cols-3 gap-3">
        <div className="skeleton h-20" /><div className="skeleton h-20" /><div className="skeleton h-20" />
      </div>
      <div className="skeleton h-48" />
    </main>
  )
}
