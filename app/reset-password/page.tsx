'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function updatePassword() {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Password updated. You can now log in.')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1500)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold">
          Set new password
        </h1>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded border border-gray-300 p-3 text-black"
        />

        <button
          onClick={updatePassword}
          className="w-full rounded bg-black p-3 text-white"
        >
          Update password
        </button>

        {message && (
          <p className="mt-4 text-sm text-blue-700">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}