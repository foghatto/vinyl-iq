import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Artist = {
  id: string
  name: string | null
}

type Release = {
  id: string
  artist_id: string | null
  title: string | null
  release_year: number | null
  cover_url: string | null
  artists: Artist | null
}

type CollectionItem = {
  id: string
  condition_media: string | null
  condition_sleeve: string | null
  purchase_price: number | null
  purchase_currency: string | null
  releases: Release | null
}

export default async function CollectionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: collectionItems, error } = await supabase
    .from('collection_items')
    .select(
      `
        id,
        user_id,
        release_id,
        condition_media,
        condition_sleeve,
        purchase_price,
        purchase_currency,
        purchase_date,
        purchase_source,
        location,
        notes,
        is_favorite,
        created_at,
        updated_at,
        releases (
          id,
          artist_id,
          label_id,
          title,
          release_year,
          country,
          format,
          format_description,
          catalog_number,
          barcode,
          cover_url,
          description,
          discogs_release_id,
          musicbrainz_release_id,
          created_at,
          updated_at,
          artists (
            id,
            name,
            sort_name,
            image_url,
            discogs_artist_id,
            musicbrainz_artist_id,
            created_at,
            updated_at
          )
        )
      `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Impossibile caricare la collezione')
  }

  const items = (collectionItems ?? []) as unknown as CollectionItem[]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <a href="/" className="text-sm text-gray-500 hover:text-black">
          ← Torna alla dashboard
        </a>

        <header className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              La mia collezione
            </h1>
            <p className="mt-2 text-gray-600">
              {items.length === 1
                ? '1 disco nella tua collezione'
                : `${items.length} dischi nella tua collezione`}
            </p>
          </div>

          <a
            href="/collection/add"
            className="inline-block rounded-xl bg-black px-5 py-3 text-center font-medium text-white hover:bg-gray-800"
          >
            + Aggiungi disco
          </a>
        </header>

        {items.length === 0 ? (
          <section className="mt-10 rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
              💿
            </div>
            <h2 className="mt-5 text-xl font-semibold">
              La tua collezione è ancora vuota
            </h2>
            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Aggiungi il tuo primo disco per iniziare a costruire la tua
              collezione.
            </p>
            <a
              href="/collection/add"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
            >
              + Aggiungi il primo disco
            </a>
          </section>
        ) : (
          <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const release = item.releases
              const artist = release?.artists
              const purchasePrice = item.purchase_price

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="aspect-square bg-gray-100">
                    {release?.cover_url ? (
                      <img
                        src={release.cover_url}
                        alt={`Copertina di ${release.title}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        💿
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="truncate text-sm font-medium text-gray-500">
                      {artist?.name ?? 'Artista sconosciuto'}
                    </p>
                    <h2 className="mt-1 truncate text-lg font-semibold">
                      {release?.title ?? 'Titolo sconosciuto'}
                    </h2>
                    {release?.release_year && (
                      <p className="mt-1 text-sm text-gray-500">
                        {release.release_year}
                      </p>
                    )}

                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Vinile</dt>
                        <dd className="font-medium">{item.condition_media}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Copertina</dt>
                        <dd className="font-medium">{item.condition_sleeve}</dd>
                      </div>
                      {purchasePrice !== null && purchasePrice !== undefined && (
                        <div className="flex justify-between gap-4 border-t pt-2">
                          <dt className="text-gray-500">Acquisto</dt>
                          <dd className="font-medium">
                            {new Intl.NumberFormat('it-IT', {
                              style: 'currency',
                              currency: item.purchase_currency || 'EUR',
                            }).format(Number(purchasePrice))}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
