import { NextRequest, NextResponse } from 'next/server'

type DiscogsRelease = {
  id: number
  title: string
  year?: number
  country?: string
  formats?: Array<{
    name?: string
    descriptions?: string[]
    text?: string
  }>
  labels?: Array<{
    id?: number
    name?: string
    catno?: string
  }>
  identifiers?: Array<{
    type?: string
    value?: string
  }>
  images?: Array<{
    uri?: string
    uri150?: string
  }>
  artists?: Array<{
    id?: number
    name?: string
  }>
}

export async function GET(request: NextRequest) {
  const releaseId = request.nextUrl.searchParams.get('id')?.trim()

  if (!releaseId || !Number.isFinite(Number(releaseId))) {
    return NextResponse.json(
      { error: 'Parametro id mancante o non valido' },
      { status: 400 }
    )
  }

  const token = process.env.DISCOGS_API_TOKEN

  if (!token) {
    return NextResponse.json(
      { error: 'DISCOGS_API_TOKEN non configurato' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://api.discogs.com/releases/${encodeURIComponent(releaseId)}`,
      {
        headers: {
          Authorization: `Discogs token=${token}`,
          'User-Agent': 'VINYL-IQ/1.0 +http://localhost:3000',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)

      return NextResponse.json(
        {
          error:
            errorData?.message ||
            'Errore nel recupero dei dettagli Discogs',
        },
        { status: response.status }
      )
    }

    const data: DiscogsRelease = await response.json()

    return NextResponse.json({
      id: data.id,
      title: data.title,
      year: data.year,
      country: data.country,
      format: Array.isArray(data.formats)
        ? data.formats.flatMap((item) => [
            ...(item.name ? [item.name] : []),
            ...(item.descriptions ?? []),
            ...(item.text ? [item.text] : []),
          ])
        : [],
      catno: Array.isArray(data.labels)
        ? data.labels
            .map((label) => label.catno)
            .filter(Boolean)
            .join(' / ')
        : '',
      barcode: Array.isArray(data.identifiers)
        ? data.identifiers
            .filter((item) => item.type === 'Barcode' && item.value)
            .map((item) => item.value as string)
        : [],
      cover_image: data.images?.[0]?.uri || data.images?.[0]?.uri150 || null,
      artists: (data.artists ?? []).map((artist) => ({
        id: artist.id,
        name: artist.name,
      })),
      labels: (data.labels ?? []).map((label) => ({
        id: label.id,
        name: label.name,
      })),
    })
  } catch (error) {
    console.error('Discogs release error:', error)

    return NextResponse.json(
      { error: 'Errore di connessione a Discogs' },
      { status: 500 }
    )
  }
}
