import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: artists, error } = await supabase
    .from('artists')
    .select('id, name')
    .limit(10)

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">VINYL IQ</h1>

      <p className="mt-2 text-gray-600">
        Test connessione Supabase
      </p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Artists</h2>

        {error ? (
          <p className="mt-4 text-red-600">
            Errore: {error.message}
          </p>
        ) : artists && artists.length > 0 ? (
          <ul className="mt-4 list-disc pl-6">
            {artists.map((artist) => (
              <li key={artist.id}>{artist.name}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-gray-500">
            Nessun artista presente nel database.
          </p>
        )}
      </div>
    </main>
  )
}
