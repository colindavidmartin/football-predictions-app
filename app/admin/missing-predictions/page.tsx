'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function MissingPredictionsPage() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
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
    }
  }

  async function loadMissingPredictions() {
    setMessage('')

    if (!fromDate || !toDate) {
      setMessage('Please select a start and end date.')
      return
    }

    const { data, error } = await supabase
      .from('missing_predictions_admin')
      .select('*')
      .gte('kickoff_at', `${fromDate}T00:00:00`)
      .lte('kickoff_at', `${toDate}T23:59:59`)
      .order('kickoff_at')
      .order('display_name')

    if (error) {
      setMessage(error.message)
      return
    }

    setRows(data ?? [])
  }

  const uniquePlayers = Array.from(
    new Map(
      rows.map((row) => [
        row.profile_id,
        {
          display_name: row.display_name,
          email: row.email,
          league_name: row.league_name,
          department: row.department,
        },
      ])
    ).values()
  )

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-2">
        Missing Predictions
      </h1>

      <p className="mb-4 text-sm text-gray-600">
        Admin-only reminder list for players with blank predictions in a selected date range.
      </p>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        />

        <button
          onClick={loadMissingPredictions}
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          Check missing
        </button>
      </div>

      {message && (
        <p className="mb-4 text-sm text-blue-700">
          {message}
        </p>
      )}

      <div className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 text-xl font-bold">
          Players to remind: {uniquePlayers.length}
        </h2>

        <div className="space-y-1 text-sm">
          {uniquePlayers.map((player: any) => (
            <div key={`${player.email}-${player.display_name}`}>
              <strong>{player.display_name}</strong>
              {' · '}
              {player.email ?? 'No email stored'}
              {' · '}
              {player.league_name ?? ''}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-200 text-black font-semibold">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Fixture</th>
              <th className="p-2 text-left">Player</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">League</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={`${row.fixture_id}-${row.entry_id}`} className="border-t">
                <td className="p-2">
                  {new Date(row.kickoff_at).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                  })}
                </td>

                <td className="p-2">
                  {row.home_team} vs {row.away_team}
                </td>

                <td className="p-2 font-medium">
                  {row.display_name}
                </td>

                <td className="p-2">
                  {row.email ?? ''}
                </td>

                <td className="p-2">
                  {row.league_name ?? ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}