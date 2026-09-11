import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'ID release mancante' },
      { status: 400 }
    )
  }

  const token = process.env.DISCOGS_API_TOKEN

  if (!token) {
    return NextResponse.json(
      { error: 'Token Discogs mancante' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://api.discogs.com/releases/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Discogs token=${token}`,
          'User-Agent': 'VINYL-IQ/1.0 +http://localhost:3000',
        },
        cache: 'no-store',
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            'Errore nel recupero dei dettagli Discogs',
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      year: data.year,
      country: data.country,

      format: Array.isArray(data.formats)
        ? data.formats.flatMap(
            (item: {
              name?: string
              descriptions?: string[]
              text?: string
            }) => [
              ...(item.name ? [item.name] : []),
              ...(item.descriptions ?? []),
              ...(item.text ? [item.text] : []),
            ]
          )
        : [],

      catno: Array.isArray(data.labels)
        ? data.labels
            .map((label: { catno?: string }) => label.catno)
            .filter(Boolean)
            .join(' / ')
        : '',

      barcode: Array.isArray(data.identifiers)
        ? data.identifiers
            .filter(
              (item: {
                type?: string
                value?: string
              }) =>
                item.type === 'Barcode' && item.value
            )
            .map(
              (item: { value?: string }) => item.value
            )
        : [],

      cover_image:
        data.images?.[0]?.uri ||
        data.images?.[0]?.uri150 ||
        null,

      artists: data.artists,
      labels: data.labels,
    })
  } catch (error) {
    console.error('Discogs release error:', error)

    return NextResponse.json(
      { error: 'Errore di connessione a Discogs' },
      { status: 500 }
    )
  }
}
