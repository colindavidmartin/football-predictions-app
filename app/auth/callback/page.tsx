'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuthCallback() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        router.push('/login')
        return
      }

      if (data.session) {
        router.push('/predictions')
        return
      }

      router.push('/login')
    }

    handleAuthCallback()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p>Logging you in...</p>
    </main>
  )
}