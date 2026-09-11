'use client'

import { FormEvent, useRef, useState } from 'react'

type DiscogsResult = {
  id: number
  title: string
  year?: string
  country?: string
  format?: string[]
  label?: string[]
  catno?: string
  cover_image?: string
}

type DiscogsReleaseDetails = DiscogsResult & {
  barcode?: string[]
  artists?: Array<{
    id?: number
    name?: string
  }>
  labels?: Array<{
    id?: number
    name?: string
  }>}

const conditions = [
  'M',
  'NM',
  'VG+',
  'VG',
  'G+',
  'G',
  'F',
  'P',
]

export default function AddRecordPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DiscogsResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedResult, setSelectedResult] =
  useState<DiscogsReleaseDetails | null>(null)

const [detailsLoading, setDetailsLoading] = useState(false)
const [saveError, setSaveError] = useState('')
const [saving, setSaving] = useState(false)

  const [mediaCondition, setMediaCondition] = useState('')
  const [sleeveCondition, setSleeveCondition] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseSource, setPurchaseSource] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [favorite, setFavorite] = useState(false)

  const selectedSectionRef = useRef<HTMLElement | null>(null)

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const search = query.trim()

    if (!search) return

    setHasSearched(true)
    setSelectedResult(null)
    setLoading(true)
    setError('')
    setResults([])

    try {
      const response = await fetch(
        `/api/discogs/search?q=${encodeURIComponent(search)}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Errore durante la ricerca'
        )
      }

      setResults(data.results || [])
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Errore durante la ricerca'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectResult(result: DiscogsResult) {
  setSelectedResult(null)
  setSaveError('')
  setDetailsLoading(true)

  try {
    const response = await fetch(
      `/api/discogs/release?id=${result.id}`
    )

    const details = await response.json()

    if (!response.ok) {
      throw new Error(
        details.error || 'Errore nel caricamento dei dettagli'
      )
    }

    setSelectedResult(details as DiscogsReleaseDetails)

    setTimeout(() => {
      selectedSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 50)
  } catch (error) {
    setSaveError(
      error instanceof Error
        ? error.message
        : 'Errore nel caricamento dei dettagli'
    )
  } finally {
    setDetailsLoading(false)
  }
}  async function handleSaveCopy(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault()

  if (!selectedResult) {
    alert('Seleziona prima un disco.')
    return
  }

  if (!mediaCondition || !sleeveCondition) {
    alert(
      'Inserisci la condizione del vinile e della copertina.'
    )
    return
  }

  setSaving(true)
  setSaveError('')

  try {
    const { saveCollectionItem } = await import(
      '@/lib/actions/collection'
    )

    await saveCollectionItem({
      discogsReleaseId: selectedResult.id,
      title: selectedResult.title,
      year: selectedResult.year,
      country: selectedResult.country,
      format: selectedResult.format,
      catno: selectedResult.catno,
      barcode: selectedResult.barcode,
      coverUrl: selectedResult.cover_image,
      artists: selectedResult.artists,
      labels: selectedResult.labels,
      mediaCondition,
      sleeveCondition,
      purchasePrice,
      purchaseDate,
      purchaseSource,
      location,
      notes,
      isFavorite: favorite,
    })

    alert('Disco aggiunto alla tua collezione!')

    setSelectedResult(null)
    setMediaCondition('')
    setSleeveCondition('')
    setPurchasePrice('')
    setPurchaseDate('')
    setPurchaseSource('')
    setLocation('')
    setNotes('')
    setFavorite(false)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Errore durante il salvataggio'

    setSaveError(message)
    alert(message)
  } finally {
    setSaving(false)
  }
}

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        <a
          href="/"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Torna alla dashboard
        </a>

        <div className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Aggiungi un disco
          </h1>

          <p className="mt-2 text-gray-500">
            Cerca un artista, un album o un titolo.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex gap-3"
        >
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setHasSearched(false)
            }}
            placeholder="Es. Pink Floyd - The Dark Side of the Moon"
            className="flex-1 rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Cerco...' : 'Cerca'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && results.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">
              Risultati della ricerca
            </h2>

            <div className="mt-4 space-y-4">
              {results.map((result) => (
                <article
                  key={result.id}
                  className="flex gap-5 rounded-2xl bg-white p-5 shadow-sm"
                >
                  {result.cover_image ? (
                    <img
                      src={result.cover_image}
                      alt={result.title}
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-4xl">
                      💿
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">
                      {result.title}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      {result.year && (
                        <p>Anno: {result.year}</p>
                      )}

                      {result.country && (
                        <p>Paese: {result.country}</p>
                      )}

                      {result.label &&
                        result.label.length > 0 && (
                          <p>
                            Etichetta:{' '}
                            {result.label.join(', ')}
                          </p>
                        )}

                      {result.catno && (
                        <p>
                          Catalogo: {result.catno}
                        </p>
                      )}

                      {result.format &&
                        result.format.length > 0 && (
                          <p>
                            Formato:{' '}
                            {result.format.join(', ')}
                          </p>
                        )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectResult(result)}
                      className="mt-4 cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Scegli questa edizione
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading &&
          hasSearched &&
          results.length === 0 &&
          !error && (
            <p className="mt-8 text-center text-gray-500">
              Nessun risultato trovato.
            </p>
          )}

        {selectedResult && (
          <section
            ref={selectedSectionRef}
            className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              La tua copia
            </h2>

            <div className="mt-5 flex gap-5">
              {selectedResult.cover_image ? (
                <img
                  src={selectedResult.cover_image}
                  alt={selectedResult.title}
                  className="h-40 w-40 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-4xl">
                  💿
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold">
                  {selectedResult.title}
                </h3>
{selectedResult.artists &&
  selectedResult.artists.length > 0 && (
    <p className="mt-1 text-sm text-gray-600">
      Artista:{' '}
      {selectedResult.artists
        .map((artist) => artist.name)
        .filter(Boolean)
        .join(', ')}
    </p>
  )}

                {selectedResult.year && (
                  <p className="mt-2 text-sm text-gray-600">
                    Anno: {selectedResult.year}
                  </p>
                )}

                {selectedResult.country && (
                  <p className="mt-1 text-sm text-gray-600">
                    Paese: {selectedResult.country}
                  </p>
                )}

                {selectedResult.labels &&
  selectedResult.labels.length > 0 && (
    <p className="mt-1 text-sm text-gray-600">
      Etichetta:{' '}
      {selectedResult.labels
        .map((label) => label.name)
        .filter(Boolean)
        .join(', ')}
    </p>
  )}{selectedResult.label &&
                  selectedResult.label.length > 0 && (
                    <p className="mt-1 text-sm text-gray-600">
                      Etichetta:{' '}
                      {selectedResult.label.join(', ')}
                    </p>
                  )}

                {selectedResult.catno && (
                  <p className="mt-1 text-sm text-gray-600">
                    Catalogo: {selectedResult.catno}
                  </p>
                )}

                {selectedResult.format &&
                  selectedResult.format.length > 0 && (                    <p className="mt-1 text-sm text-gray-600">
                      Formato:{' '}
                      {selectedResult.format.join(', ')}
                    </p>
                  )}
              </div>
            </div>

            <form
              onSubmit={handleSaveCopy}
              className="mt-8 space-y-6 border-t pt-8"
            >
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Condizione del vinile *
                </label>

                <select
                  value={mediaCondition}
                  onChange={(event) =>
                    setMediaCondition(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-900"
                  required
                >
                  <option value="">
                    Seleziona condizione
                  </option>

                  {conditions.map((condition) => (
                    <option
                      key={condition}
                      value={condition}
                    >
                      {condition}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Condizione della copertina *
                </label>

                <select
                  value={sleeveCondition}
                  onChange={(event) =>
                    setSleeveCondition(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-900"
                  required
                >
                  <option value="">
                    Seleziona condizione
                  </option>

                  {conditions.map((condition) => (
                    <option
                      key={condition}
                      value={condition}
                    >
                      {condition}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Prezzo pagato
                </label>

                <div className="mt-2 flex">
                  <span className="flex items-center rounded-l-xl border border-r-0 bg-gray-50 px-4 text-gray-600">
                    €
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(event) =>
                      setPurchasePrice(event.target.value)
                    }
                    placeholder="0,00"
                    className="w-full rounded-r-xl border bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Data di acquisto
                </label>

                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(event) =>
                    setPurchaseDate(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Dove l'hai acquistato?
                </label>

                <select
                  value={purchaseSource}
                  onChange={(event) =>
                    setPurchaseSource(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-900"
                >
                  <option value="">
                    Seleziona
                  </option>
                  <option value="Negozio">
                    Negozio
                  </option>
                  <option value="Mercatino">
                    Mercatino
                  </option>
                  <option value="Online">
                    Online
                  </option>
                  <option value="Privato">
                    Privato
                  </option>
                  <option value="Altro">
                    Altro
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Posizione
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="Es. Scaffale A / Mobile 2"
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Note
                </label>

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  rows={4}
                  placeholder="Eventuali informazioni sulla tua copia..."
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(event) =>
                    setFavorite(event.target.checked)
                  }
                  className="h-5 w-5"
                />

                <span className="text-sm font-medium text-gray-900">
                  ⭐ Aggiungi ai preferiti
                </span>
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-black px-6 py-4 font-medium text-white hover:bg-gray-800"
              >
                Aggiungi alla mia collezione
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  )
}
