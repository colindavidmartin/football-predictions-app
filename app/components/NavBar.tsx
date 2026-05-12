'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setLoggedIn(!!user)
    }

    checkUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setLoggedIn(false)
    window.location.href = '/'
  }

  return (
    <nav className="flex items-center justify-between border-b bg-gray-200 px-4 py-3">
      <div className="flex gap-6 text-sm font-semibold text-black">
        <Link href="/">Home</Link>
        <Link href="/fixtures">Fixtures</Link>

        {loggedIn && (
          <Link href="/predictions">Predictions</Link>
        )}

        <Link href="/standings">Standings</Link>

        {loggedIn ? (
          <button onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <Link href="/login">Log in</Link>
        )}
      </div>

      <div className="text-sm font-semibold text-black">
        <Link href="/admin/results">Admin Results</Link>
      </div>
    </nav>
  )
}