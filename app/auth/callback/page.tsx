'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      await supabase.auth.getSession()
      router.push('/predictions')
    }

    handleAuth()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p>Logging you in...</p>
    </main>
  )
}