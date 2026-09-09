import 'server-only'

import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient> | null = null

/**
 * Creates and returns a Supabase admin client using the service-role key.
 * This client bypasses RLS and is used ONLY for operations on global tables:
 * - artists (RLS blocks INSERT/UPDATE for authenticated users)
 * - labels (RLS blocks INSERT/UPDATE for authenticated users)
 * - releases (RLS blocks INSERT/UPDATE for authenticated users)
 *
 * IMPORTANT: This key MUST NEVER be exposed to the client.
 * It can only be used in server-side code (Server Components, Server Actions, API routes).
 *
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY or URL is not configured
 * @returns Supabase admin client instance
 */
export async function createAdminClient() {
  // Return cached instance if already created
  if (adminClient) {
    return adminClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured.'
    )
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}
