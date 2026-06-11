'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function NavBar() {
const [loggedIn, setLoggedIn] = useState(false)
const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkUser() {
const { data: { user } } = await supabase.auth.getUser()

setLoggedIn(!!user)

if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  setIsAdmin(!!profile?.is_admin)
} else {
  setIsAdmin(false)
}
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
            href="/prediction-stats"
            className="hover:underline"
            >   Prediction Stats
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


{isAdmin && (
  <div className="relative group text-sm font-semibold text-black">
    <button
      type="button"
      className="hover:underline"
    >
      Admin
    </button>

    <div className="absolute right-0 z-20 hidden min-w-48 rounded border bg-white shadow-lg group-hover:block">
      <Link
        href="/admin/results"
        className="block px-4 py-2 hover:bg-gray-100"
      >
        Enter Results
      </Link>

      <Link
        href="/admin/missing-predictions"
        className="block px-4 py-2 hover:bg-gray-100"
      >
        Missing Predictions
      </Link>

      <Link
        href="/admin/daily-update"
        className="block px-4 py-2 hover:bg-gray-100"
      >
        Daily Update
      </Link>
    </div>
  </div>
)}
    </nav>
  )
}