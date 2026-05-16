'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function StandingsPage() {
  const [selectedLeague, setSelectedLeague] = useState('All')
  const [selectedRound, setSelectedRound] = useState('Overall')
  const [leagues, setLeagues] = useState<string[]>([])
  const [standings, setStandings] = useState<any[]>([])
  const [gamesPlayed, setGamesPlayed] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadLeagues()
  }, [])

  useEffect(() => {
    loadStandings()
  }, [selectedLeague, selectedRound])

  async function loadLeagues() {
    const { data } = await supabase
      .from('profiles')
      .select('league_name')
      .not('league_name', 'is', null)

    const uniqueLeagues = Array.from(
      new Set((data ?? []).map((row) => row.league_name).filter(Boolean))
    ).sort()

    setLeagues(uniqueLeagues)
  }

  async function loadStandings() {
    setMessage('')

    let standingsQuery =
      selectedRound === 'Overall'
        ? supabase.from('league_table').select('*')
        : supabase
            .from('league_table_by_round')
            .select('*')
            .eq('round_number', Number(selectedRound))

    if (selectedLeague !== 'All') {
      standingsQuery = standingsQuery.eq('league_name', selectedLeague)
    }

    const { data: standingsData, error } = await standingsQuery
      .order('total_points', { ascending: false })
      .order('exact_scores', { ascending: false })
      .order('correct_results', { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setStandings(standingsData ?? [])

    let gamesQuery = supabase
      .from('fixtures')
      .select('id', { count: 'exact', head: true })
      .eq('completed', true)

    if (selectedRound !== 'Overall') {
      gamesQuery = gamesQuery.eq('round_number', Number(selectedRound))
    }

    const { count } = await gamesQuery

    setGamesPlayed(count ?? 0)
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-2">
        League Table
      </h1>

      <p className="mb-4 text-sm text-gray-600">
        Number of games played: {gamesPlayed}
      </p>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        >
          <option value="All">All leagues</option>
          {leagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>

        <select
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        >
          <option value="Overall">Overall</option>
          <option value="1">Round 1</option>
          <option value="2">Round 2</option>
          <option value="3">Round 3</option>
          <option value="4">Round 4</option>
        </select>
      </div>

      {message && (
        <pre className="mb-4 text-red-500 text-sm">
          {message}
        </pre>
      )}

      <div className="overflow-auto border rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 sticky top-0 z-10 text-black font-semibold">
            <tr>
              <th className="p-2 text-left">Pos</th>
              <th className="p-2 text-left">Player</th>
              <th className="p-2 text-left">League</th>
              <th className="p-2 text-right">Pts</th>
              <th className="p-2 text-right">Exact</th>
              <th className="p-2 text-right">Results</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((row, index) => (
              <tr key={row.entry_id} className="border-t">
                <td className="p-2">{index + 1}</td>
                <td className="p-2 font-medium">{row.display_name}</td>
                <td className="p-2">{row.league_name ?? ''}</td>
                <td className="p-2 text-right font-bold">{row.total_points}</td>
                <td className="p-2 text-right">{row.exact_scores}</td>
                <td className="p-2 text-right">{row.correct_results}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}