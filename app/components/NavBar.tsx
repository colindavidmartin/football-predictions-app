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
        
        <Link href="/" className="hover:underline">
        Home
        </Link>


        <Link
        href="/fixtures"
        className="hover:underline"
        > Fixtures
        </Link>

        {loggedIn && (
        <>
            <Link
            href="/predictions"
            className="hover:underline"
            >
            Predictions
            </Link>

<Link
  href="/result-stats"
  className="hover:underline"
>
  Result Stats
</Link>

            <Link
            href="/results"
            className="hover:underline"
            >
            Results
            </Link>
        </>
        )}

            <Link
            href="/prediction-stats"
            className="hover:underline"
            >   Prediction Stats
            </Link>

        <Link
        href="/standings"
        className="hover:underline"
        > Standings
        </Link>

        {loggedIn ? (
  <button
    type="button"
    onClick={handleLogout}
    className="hover:underline"
  >
    Log out
  </button>
) : (
  <Link
    href="/login"
    className="hover:underline"
  >
    Log in / Register
  </Link>
)}
      </div>

      <div className="text-sm font-semibold text-black">
      <Link
  href="/admin/results"
  className="hover:underline"
>
  Enter Results
</Link>

<Link
  href="/admin/missing-predictions"
  className="hover:underline"
>
  Missing Predictions
</Link>
        </div>
    
    </nav>
  )
}