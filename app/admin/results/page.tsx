'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function AdminResultsPage() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [results, setResults] = useState<Record<string, { home: string; away: string }>>({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadFixtures()
  }, [])

  async function loadFixtures() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    setMessage('Please log in first.')
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    setMessage('You do not have admin access.')
    return
  }

  const { data } = await supabase
    .from('fixtures')
    .select('*')
    .order('kickoff_at')

    setFixtures(data ?? [])

    const map: Record<string, { home: string; away: string }> = {}

    data?.forEach((fixture) => {
      map[fixture.id] = {
        home: fixture.result_home_goals?.toString() ?? '',
        away: fixture.result_away_goals?.toString() ?? '',
      }
    })

    setResults(map)
  }

  function updateResult(fixtureId: string, side: 'home' | 'away', value: string) {
    setResults((current) => ({
      ...current,
      [fixtureId]: {
        home: current[fixtureId]?.home ?? '',
        away: current[fixtureId]?.away ?? '',
        [side]: value,
      },
    }))
  }

  async function saveResult(fixtureId: string) {
    const result = results[fixtureId]

    if (!result?.home || !result?.away) {
      setMessage('Enter both scores.')
      return
    }

    const { error } = await supabase
      .from('fixtures')
      .update({
        result_home_goals: Number(result.home),
        result_away_goals: Number(result.away),
        completed: true,
      })
      .eq('id', fixtureId)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Result saved. League table updated.')
    }
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">
        Admin Results Entry
      </h1>

      {message && (
        <p className="mb-4 text-sm text-blue-700">
          {message}
        </p>
      )}

      <div className="overflow-auto border rounded-lg max-h-[85vh]">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 sticky top-0 z-10 text-black font-semibold">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-right">Home</th>
              <th className="p-2 text-center">H</th>
              <th className="p-2 text-center">A</th>
              <th className="p-2 text-left">Away</th>
              <th className="p-2 text-left">Save</th>
            </tr>
          </thead>

          <tbody>
            {fixtures.map((fixture) => (
              <tr key={fixture.id} className="border-t">
                <td className="p-2">{fixture.match_number}</td>

                <td className="p-2">
                  {new Date(fixture.kickoff_at).toLocaleDateString('en-GB')}
                </td>

                <td className="p-2 text-right font-medium">
                  {fixture.home_team}
                </td>

                <td className="p-1 text-center">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={results[fixture.id]?.home ?? ''}
                    onChange={(e) => updateResult(fixture.id, 'home', e.target.value)}
                    className="w-12 border rounded p-1 text-center"
                  />
                </td>

                <td className="p-1 text-center">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={results[fixture.id]?.away ?? ''}
                    onChange={(e) => updateResult(fixture.id, 'away', e.target.value)}
                    className="w-12 border rounded p-1 text-center"
                  />
                </td>

                <td className="p-2 font-medium">
                  {fixture.away_team}
                </td>

                <td className="p-2">
                  <button
                    onClick={() => saveResult(fixture.id)}
                    className="bg-black text-white rounded px-3 py-1 text-xs"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}