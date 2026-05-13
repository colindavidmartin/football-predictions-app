'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('Checking reset link...')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function setupSessionFromUrl() {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)

      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setMessage(error.message)
          return
        }

        setReady(true)
        setMessage('Enter your new password.')
        return
      }

      const { data } = await supabase.auth.getSession()

      if (data.session) {
        setReady(true)
        setMessage('Enter your new password.')
      } else {
        setMessage('Reset session missing. Please request a fresh password reset link.')
      }
    }

    setupSessionFromUrl()
  }, [])

  async function updatePassword() {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Password updated. Redirecting to login...')

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

        <p className="mb-4 text-sm text-gray-700">
          {message}
        </p>

        <input
          type="password"
          placeholder="New password"
          value={password}
          disabled={!ready}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded border border-gray-300 p-3 text-black disabled:bg-gray-100"
        />

        <button
          onClick={updatePassword}
          disabled={!ready}
          className="w-full rounded bg-black p-3 text-white disabled:bg-gray-300"
        >
          Update password
        </button>
      </div>
    </main>
  )
}
