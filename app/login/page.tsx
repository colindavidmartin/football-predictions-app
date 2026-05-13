'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    window.location.href = '/predictions'
  }

  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: displayName || email,
      })
    }

    setMessage('Account created. You can now log in.')
    setMode('login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold">
          {mode === 'login' ? 'Log in' : 'Create account'}
        </h1>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode('login')}
            className={`rounded px-3 py-2 text-sm ${
              mode === 'login'
                ? 'bg-black text-white'
                : 'border border-gray-300 bg-white text-black'
            }`}
          >
            Log in
          </button>

          <button
            onClick={() => setMode('signup')}
            className={`rounded px-3 py-2 text-sm ${
              mode === 'signup'
                ? 'bg-black text-white'
                : 'border border-gray-300 bg-white text-black'
            }`}
          >
            Sign up
          </button>
        </div>

        <div className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded border border-gray-300 p-3 text-black"
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 p-3 text-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 p-3 text-black"
          />

          <button
            onClick={mode === 'login' ? handleLogin : handleSignup}
            className="w-full rounded bg-black p-3 text-white"
          >
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          {message && (
            <p className="text-sm text-blue-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}