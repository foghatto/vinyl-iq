'use server'

import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type SaveCollectionItemInput = {
  discogsReleaseId: number
  title: string
  year?: string | number
  country?: string
  format?: string[] | string
  catno?: string
  barcode?: string | string[]
  coverUrl?: string
  artists?: Array<{
    id?: number
    name?: string
  }>
  labels?: Array<{
    id?: number
    name?: string
  }>
  mediaCondition: string
  sleeveCondition: string
  purchasePrice?: string
  purchaseDate?: string
  purchaseSource?: string
  location?: string
  notes?: string
  isFavorite?: boolean
}

type SupabaseClient = Awaited<ReturnType<typeof createAdminClient>>

async function ensureArtist(
  admin: SupabaseClient,
  artist: { id?: number; name?: string }
) {
  const name = artist.name?.trim()

  if (!name) return null

  if (artist.id) {
    const { data: existing } = await admin
      .from('artists')
      .select('id')
      .eq('discogs_artist_id', artist.id)
      .maybeSingle()

    if (existing) return existing.id
  }

  const { data: byName } = await admin
    .from('artists')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  if (byName) return byName.id

  const { data: inserted, error } = await admin
    .from('artists')
    .insert({
      name,
      discogs_artist_id: artist.id ?? null,
    })
    .select('id')
    .single()

  if (!error && inserted) return inserted.id

  const { data: retry } = await admin
    .from('artists')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  return retry?.id ?? null
}

async function ensureLabel(
  admin: SupabaseClient,
  label: { id?: number; name?: string }
) {
  const name = label.name?.trim()

  if (!name) return null

  if (label.id) {
    const { data: existing } = await admin
      .from('labels')
      .select('id')
      .eq('discogs_label_id', label.id)
      .maybeSingle()

    if (existing) return existing.id
  }

  const { data: byName } = await admin
    .from('labels')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  if (byName) return byName.id

  const { data: inserted, error } = await admin
    .from('labels')
    .insert({
      name,
      discogs_label_id: label.id ?? null,
    })
    .select('id')
    .single()

  if (!error && inserted) return inserted.id

  const { data: retry } = await admin
    .from('labels')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  return retry?.id ?? null
}

async function ensureRelease(
  admin: SupabaseClient,
  input: SaveCollectionItemInput,
  artistId: string | null,
  labelId: string | null
) {
  const discogsReleaseId = input.discogsReleaseId

  const { data: existing } = await admin
    .from('releases')
    .select('id')
    .eq('discogs_release_id', discogsReleaseId)
    .maybeSingle()

  if (existing) return existing.id

  const format = Array.isArray(input.format)
    ? input.format.join(', ')
    : input.format ?? null

  const barcode = Array.isArray(input.barcode)
    ? input.barcode.join(', ')
    : input.barcode ?? null

  const { data: inserted, error } = await admin
    .from('releases')
    .insert({
      artist_id: artistId,
      label_id: labelId,
      title: input.title,
      release_year: input.year ? Number(input.year) || null : null,
      country: input.country ?? null,
      format,
      catalog_number: input.catno ?? null,
      barcode,
      cover_url: input.coverUrl ?? null,
      discogs_release_id: discogsReleaseId,
    })
    .select('id')
    .single()

  if (!error && inserted) return inserted.id

  const { data: retry } = await admin
    .from('releases')
    .select('id')
    .eq('discogs_release_id', discogsReleaseId)
    .maybeSingle()

  if (retry) return retry.id

  throw error ?? new Error('Impossibile creare la release')
}

export async function saveCollectionItem(
  input: SaveCollectionItemInput
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Devi essere autenticato per salvare un disco')
  }

  const admin = createAdminClient()

  const firstArtist = input.artists?.find((artist) => artist.name)
  const firstLabel = input.labels?.find((label) => label.name)

  const artistId = firstArtist
    ? await ensureArtist(admin, firstArtist)
    : null

  const labelId = firstLabel
    ? await ensureLabel(admin, firstLabel)
    : null

  const releaseId = await ensureRelease(
    admin,
    input,
    artistId,
    labelId
  )

  const purchasePrice =
    input.purchasePrice?.trim() !== ''
      ? Number(input.purchasePrice)
      : null

  if (
    purchasePrice !== null &&
    (!Number.isFinite(purchasePrice) || purchasePrice < 0)
  ) {
    throw new Error('Prezzo di acquisto non valido')
  }

  const { data, error } = await supabase
    .from('collection_items')
    .insert({
      user_id: user.id,
      release_id: releaseId,
      condition_media: input.mediaCondition,
      condition_sleeve: input.sleeveCondition,
      purchase_price: purchasePrice,
      purchase_currency: 'EUR',
      purchase_date: input.purchaseDate || null,
      purchase_source: input.purchaseSource || null,
      location: input.location || null,
      notes: input.notes || null,
      is_favorite: input.isFavorite ?? false,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(
      `Errore nel salvataggio della copia: ${error.message}`
    )
  }

  return {
    success: true,
    id: data.id,
    releaseId,
  }
}
