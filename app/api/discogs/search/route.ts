import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()

  if (!query) {
    return NextResponse.json(
      { error: 'Parametro di ricerca mancante' },
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

  const url = new URL('https://api.discogs.com/database/search')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'release')
  url.searchParams.set('per_page', '10')

  const response = await fetch(url.toString(), {
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
        error: 'Errore nella richiesta a Discogs',
        details: errorText,
      },
      { status: response.status }
    )
  }

  const data = await response.json()

  return NextResponse.json(data)
}