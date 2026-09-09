import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VINYL IQ</h1>
            <p className="mt-1 text-sm text-gray-500">
              La tua collezione. Il tuo valore. Il tuo prossimo disco.
            </p>
          </div>

          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Esci
            </button>
          </form>
        </header>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">
            Ciao! 👋
          </h2>

          <p className="mt-2 text-gray-600">
            {user?.email
              ? `Benvenuto, ${user.email}`
              : 'Ecco una panoramica della tua collezione.'}
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Dischi in collezione
            </p>
            <p className="mt-3 text-4xl font-bold">0</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Valore stimato
            </p>
            <p className="mt-3 text-4xl font-bold">€ 0</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Wishlist
            </p>
            <p className="mt-3 text-4xl font-bold">0</p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
            💿
          </div>

          <h3 className="mt-5 text-xl font-semibold">
            La tua collezione è ancora vuota
          </h3>

          <p className="mx-auto mt-2 max-w-md text-gray-500">
            Inizia ad aggiungere i tuoi vinili e VINYL IQ
            inizierà a conoscere la tua collezione.
          </p>

          <a
  href="/collection/add"
  className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
>
  + Aggiungi il primo disco
</a>        </section>
      </div>
    </main>
  )
}
