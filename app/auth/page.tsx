'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const supabase = createClient()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        window.location.href = '/'
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage(
          'Registrazione completata. Controlla la tua email per confermare l’account.'
        )
      }
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">VINYL IQ</h1>

        <p className="mt-2 text-gray-600">
          {isLogin ? 'Accedi alla tua collezione' : 'Crea il tuo account'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              placeholder="nome@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
              placeholder="Almeno 6 caratteri"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {loading
              ? 'Attendi...'
              : isLogin
                ? 'Accedi'
                : 'Registrati'}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-lg bg-gray-100 p-4 text-sm">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            setMessage('')
          }}
          className="mt-6 text-sm underline"
        >
          {isLogin
            ? 'Non hai ancora un account? Registrati'
            : 'Hai già un account? Accedi'}
        </button>
      </div>
    </main>
  )
}
