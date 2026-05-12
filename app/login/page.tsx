'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold">
          Login
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-3"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white rounded p-3"
        >
          Send Magic Link
        </button>

        {message && (
          <p>{message}</p>
        )}
      </div>
    </main>
  )
}