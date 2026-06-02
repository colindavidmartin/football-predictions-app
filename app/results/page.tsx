'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [leagues, setLeagues] = useState<string[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [selectedLeague, setSelectedLeague] = useState('All')
  const [selectedEntryId, setSelectedEntryId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPage()
  }, [])

  useEffect(() => {
    loadResults()
  }, [selectedLeague, selectedEntryId])

  async function loadPage() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please log in first.')
      return
    }

    const { data: profileRows } = await supabase
      .from('completed_prediction_results')
      .select('entry_id, display_name, league_name, profile_id')

    const uniqueLeagues = Array.from(
      new Set((profileRows ?? []).map((row) => row.league_name).filter(Boolean))
    ).sort()

    const uniquePlayers = Array.from(
      new Map(
        (profileRows ?? []).map((row) => [
          row.entry_id,
          {
            entry_id: row.entry_id,
            display_name: row.display_name,
            league_name: row.league_name,
            profile_id: row.profile_id,
          },
        ])
      ).values()
    ).sort((a: any, b: any) => a.display_name.localeCompare(b.display_name))

    setLeagues(uniqueLeagues)
    setPlayers(uniquePlayers)

    const myPlayer = uniquePlayers.find((player: any) => player.profile_id === user.id)

    if (myPlayer) {
      setSelectedEntryId(myPlayer.entry_id)
    }
  }

  async function loadResults() {
    if (!selectedEntryId) return

    let query = supabase
      .from('completed_prediction_results')
      .select('*')
      .eq('entry_id', selectedEntryId)
      .order('kickoff_at')

    if (selectedLeague !== 'All') {
      query = query.eq('league_name', selectedLeague)
    }

    const { data, error } = await query

    if (error) {
      setMessage(error.message)
      return
    }

    setResults(data ?? [])
  }

  const filteredPlayers =
    selectedLeague === 'All'
      ? players
      : players.filter((player) => player.league_name === selectedLeague)

  const totalPoints = results.reduce((sum, row) => sum + (row.points ?? 0), 0)
  const gamesShown = results.length

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-2">
        Results
      </h1>

      <p className="mb-4 text-sm text-gray-600">
        Completed matches only. Select a player to view their predictions and points.
      </p>

        <div className="mb-4 flex gap-4 text-sm">
        <div className="rounded border bg-white px-3 py-2">
            Games shown: <strong>{gamesShown}</strong>
        </div>

        <div className="rounded border bg-white px-3 py-2">
            Total points: <strong>{totalPoints}</strong>
        </div>
        </div>


      {message && (
        <p className="mb-4 text-sm text-blue-700">
          {message}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={selectedLeague}
          onChange={(e) => {
            setSelectedLeague(e.target.value)
            setSelectedEntryId('')
            setResults([])
          }}
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
          value={selectedEntryId}
          onChange={(e) => setSelectedEntryId(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        >
          <option value="">Select player</option>
          {filteredPlayers.map((player) => (
            <option key={player.entry_id} value={player.entry_id}>
              {player.display_name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-auto border rounded-lg max-h-[85vh] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 sticky top-0 z-10 text-black font-semibold">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Rnd</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Group</th>
              <th className="p-2 text-right">Home</th>
              <th className="p-2 text-center">Prediction</th>
              <th className="p-2 text-center">Result</th>
                <th className="p-2 text-left">Away</th>
                <th className="p-2 text-center">Outcome</th>
                <th className="p-2 text-right">Pts</th>
            </tr>
          </thead>

          <tbody>
            {results.map((row) => (

                <tr
                key={`${row.entry_id}-${row.fixture_id}`}
                className={`
                    border-t
                    ${row.exact_score ? 'bg-green-50' : ''}
                    ${!row.exact_score && row.correct_result ? 'bg-blue-50' : ''}
                    ${row.predicted_home_goals === null || row.predicted_away_goals === null ? 'bg-gray-100' : ''}
                `}
                >

                <td className="p-2">{row.match_number}</td>
                <td className="p-2">{row.round_number}</td>

                <td className="p-2">
                  {new Date(row.kickoff_at).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                  })}
                </td>

                <td className="p-2">
                  {new Date(row.kickoff_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </td>

                <td className="p-2">{row.group_name}</td>

                <td className="p-2 font-medium text-right">
                  {row.home_team}
                </td>

                <td className="p-2 text-center">
                  {row.predicted_home_goals === null || row.predicted_away_goals === null
                    ? 'Missed'
                    : `${row.predicted_home_goals}-${row.predicted_away_goals}`}
                </td>

                <td className="p-2 text-center font-semibold">
                  {row.result_home_goals}-{row.result_away_goals}
                </td>

                <td className="p-2 font-medium">
                {row.away_team}
                </td>

                <td className="p-2 text-center text-xs">
                {row.predicted_home_goals === null || row.predicted_away_goals === null
                    ? 'Missed'
                    : row.exact_score
                    ? '✓ Exact Score'
                    : row.correct_result
                    ? '✓ Correct Result'
                    : '✗ Incorrect'}
                </td>

                <td className="p-2 text-right font-bold">
                {row.points ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}