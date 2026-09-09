import { NextRequest, NextResponse } from 'next/server'

type DiscogsArtist = {
  name: string
  id: number
  resource_url: string
}

type DiscogsLabel = {
  name: string
  id: number
  resource_url: string
}

type DiscogsReleaseDetail = {
  id: number
  title: string
  year: number
  country: string
  released: string
  format: string[]
  labels: DiscogsLabel[]
  artists: DiscogsArtist[]
  catno: string
  barcode: string[]
  thumb: string
  uri: string
  resource_url: string
  description?: string
}

type ResponseResult = {
  id: number
  title: string
  year?: number
  country?: string
  format?: string[]
  catno?: string
  barcode?: string
  cover_image?: string
  artists: Array<{ name: string; id: number }>
  labels: Array<{ name: string; id: number }>
}

export async function GET(request: NextRequest) {
  const releaseId = request.nextUrl.searchParams.get('id')?.trim()

  if (!releaseId || isNaN(Number(releaseId))) {
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
    const url = `https://api.discogs.com/releases/${releaseId}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Discogs token=${token}`,
        'User-Agent': 'VINYL-IQ/0.1 +http://localhost:3000',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()

      return NextResponse.json(
        {
          error: 'Errore nel recupero dettagli da Discogs',
          details: errorText,
        },
        { status: response.status }
      )
    }

    const data: DiscogsReleaseDetail = await response.json()

    const result: ResponseResult = {
      id: data.id,
      title: data.title,
      year: data.year,
      country: data.country,
      format: data.format,
      catno: data.catno,
      barcode: data.barcode && data.barcode.length > 0 ? data.barcode[0] : undefined,
      cover_image: data.thumb && data.thumb !== '' ? data.thumb : undefined,
      artists: (data.artists || []).map((artist) => ({
        name: artist.name,
        id: artist.id,
      })),
      labels: (data.labels || []).map((label) => ({
        name: label.name,
        id: label.id,
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching release details:', error)

    return NextResponse.json(
      {
        error: 'Errore sconosciuto nel recupero dettagli',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
