'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function DailyUpdatePage() {
  const [fromDateTime, setFromDateTime] = useState('')
  const [toDateTime, setToDateTime] = useState('')
  const [selectedLeague, setSelectedLeague] = useState('All')
  const [leagues, setLeagues] = useState<string[]>([])
  const [fixtures, setFixtures] = useState<any[]>([])
  const [topPlayers, setTopPlayers] = useState<any[]>([])
const [message, setMessage] = useState('')
const [updateText, setUpdateText] = useState('')
const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdmin()
    loadLeagues()
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
      return
    }

    setIsAdmin(true)
  }

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

  async function generateUpdate() {
    setMessage('')

    if (!fromDateTime || !toDateTime) {
      setMessage('Please select a from and to date/time.')
      return
    }

    const { data: fixtureRows, error: fixtureError } = await supabase
      .from('result_prediction_stats')
      .select('*')
      .gte('kickoff_at', fromDateTime)
      .lte('kickoff_at', toDateTime)
      .order('kickoff_at')

    if (fixtureError) {
      setMessage(fixtureError.message)
      return
    }

    setFixtures(fixtureRows ?? [])

    let playerQuery = supabase
      .from('completed_prediction_results')
      .select('*')
      .gte('kickoff_at', fromDateTime)
      .lte('kickoff_at', toDateTime)

    if (selectedLeague !== 'All') {
      playerQuery = playerQuery.eq('league_name', selectedLeague)
    }

    const { data: playerRows, error: playerError } = await playerQuery

    if (playerError) {
      setMessage(playerError.message)
      return
    }

    const groupedPlayers = new Map<string, any>()

    ;(playerRows ?? []).forEach((row: any) => {
      const current = groupedPlayers.get(row.entry_id) ?? {
        entry_id: row.entry_id,
        display_name: row.display_name,
        league_name: row.league_name,
        department: row.department,
        total_points: 0,
        exact_scores: 0,
        correct_results: 0,
        fixtures: [],
      }

      current.total_points += row.points ?? 0

      if (row.exact_score) {
        current.exact_scores += 1
      }

      if (row.correct_result) {
        current.correct_results += 1
      }

      if (row.exact_score || row.correct_result) {
        current.fixtures.push({
          fixture: `${row.home_team} ${row.result_home_goals}-${row.result_away_goals} ${row.away_team}`,
          prediction:
            row.predicted_home_goals === null || row.predicted_away_goals === null
              ? 'Missed'
              : `${row.predicted_home_goals}-${row.predicted_away_goals}`,
          exact_score: row.exact_score,
          correct_result: row.correct_result,
          points: row.points ?? 0,
        })
      }

      groupedPlayers.set(row.entry_id, current)
    })

    const sortedPlayers = Array.from(groupedPlayers.values())
      .sort((a, b) =>
        b.total_points - a.total_points ||
        b.exact_scores - a.exact_scores ||
        b.correct_results - a.correct_results
      )
      .slice(0, 10)

    setTopPlayers(sortedPlayers)

    const fixtureText = (fixtureRows ?? [])
  .map(
    (fixture: any) =>
      `${fixture.home_team} ${fixture.result_home_goals}-${fixture.result_away_goals} ${fixture.away_team}`
  )
  .join('\n')

const topPlayerText = sortedPlayers
  .slice(0, 5)
  .map(
    (player, index) =>
      `${index + 1}. ${player.display_name} - ${player.total_points} pts`
  )
  .join('\n')

const surpriseFixtures = (fixtureRows ?? [])
  .map((fixture: any) => {
    const total = fixture.total_predictions ?? 0

    let actualOutcome = ''
    let predictedCount = 0

    if (fixture.result_home_goals > fixture.result_away_goals) {
      actualOutcome = `${fixture.home_team} win`
      predictedCount = fixture.home_win_predictions ?? 0
    } else if (fixture.result_home_goals === fixture.result_away_goals) {
      actualOutcome = 'draw'
      predictedCount = fixture.draw_predictions ?? 0
    } else {
      actualOutcome = `${fixture.away_team} win`
      predictedCount = fixture.away_win_predictions ?? 0
    }

    const predictedPercent =
      total > 0 ? Math.round((predictedCount / total) * 100) : 0

    return {
      fixture: `${fixture.home_team} ${fixture.result_home_goals}-${fixture.result_away_goals} ${fixture.away_team}`,
      actualOutcome,
      predictedPercent,
      total,
    }
  })
  .filter((fixture: any) => fixture.total > 0)
  .sort((a: any, b: any) => a.predictedPercent - b.predictedPercent)

const biggestSurprise = surpriseFixtures[0]

const surpriseText = biggestSurprise
  ? `Biggest surprise:
${biggestSurprise.fixture}
Only ${biggestSurprise.predictedPercent}% predicted a ${biggestSurprise.actualOutcome}.`
  : 'Biggest surprise:\nNo prediction data available.'


  const mostPredictable =
  surpriseFixtures.length > 0
    ? [...surpriseFixtures].sort(
        (a: any, b: any) => b.predictedPercent - a.predictedPercent
      )[0]
    : null

const predictableText = mostPredictable
  ? `Most predictable:
${mostPredictable.fixture}
${mostPredictable.predictedPercent}% predicted a ${mostPredictable.actualOutcome}.`
  : 'Most predictable:\nNo prediction data available.'


const exactScoreText = sortedPlayers
  .flatMap((player) =>
    player.fixtures
      .filter((fixture: any) => fixture.exact_score)
      .map(
        (fixture: any) =>
          `• ${player.display_name} - ${fixture.fixture} (predicted ${fixture.prediction}, ${fixture.points} pts)`
      )
  )
  .join('\n')

const correctResultText = sortedPlayers
  .flatMap((player) =>
    player.fixtures
      .filter((fixture: any) => fixture.correct_result && !fixture.exact_score)
      .map(
        (fixture: any) =>
          `• ${player.display_name} - ${fixture.fixture} (predicted ${fixture.prediction}, ${fixture.points} pts)`
      )
  )
  .join('\n')

setUpdateText(
  `World Cup Predictor Update${selectedLeague !== 'All' ? ` - ${selectedLeague}` : ''}

Results:
${fixtureText || 'No fixtures found.'}

${surpriseText}

${predictableText}

Top performers:
${topPlayerText || 'No scores found.'}

Exact scores:
${exactScoreText || 'No exact scores.'}

Correct results:
${correctResultText || 'No correct results.'}
`
)
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-2">
          Daily Update
        </h1>

        {message && (
          <p className="text-sm text-blue-700">
            {message}
          </p>
        )}
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-2">
        Daily Update
      </h1>

      <p className="mb-4 text-sm text-gray-600">
        Generate a summary for fixtures that kicked off within a selected date/time range.
      </p>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="datetime-local"
          value={fromDateTime}
          onChange={(e) => setFromDateTime(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        />

        <input
          type="datetime-local"
          value={toDateTime}
          onChange={(e) => setToDateTime(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        />

        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-black"
        >
          <option value="All">Overall / All leagues</option>
          {leagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>

        <button
          onClick={generateUpdate}
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          Generate update
        </button>
      </div>

      {message && (
        <p className="mb-4 text-sm text-blue-700">
          {message}
        </p>
      )}

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-3 text-xl font-bold">
          Fixtures included
        </h2>

        {fixtures.length === 0 ? (
          <p className="text-sm text-gray-600">
            No completed fixtures found for this range.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {fixtures.map((fixture) => (
              <div key={fixture.fixture_id}>
                <strong>
                  {fixture.home_team} {fixture.result_home_goals}-{fixture.result_away_goals} {fixture.away_team}
                </strong>
                {' · '}
                {new Date(fixture.kickoff_at).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })}
                {' '}
                {new Date(fixture.kickoff_at).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 text-xl font-bold">
          Top performers
        </h2>

        <section className="mt-6 rounded border bg-white p-4">
  <h2 className="mb-3 text-xl font-bold">
    WhatsApp Update
  </h2>

<button
  onClick={() => navigator.clipboard.writeText(updateText)}
  className="mb-3 rounded bg-black px-4 py-2 text-sm text-white"
>
  Copy update
</button>


  <textarea
    value={updateText}
    readOnly
    rows={15}
    className="w-full rounded border border-gray-300 p-3 text-sm text-black"
  />
</section>

        {topPlayers.length === 0 ? (
          <p className="text-sm text-gray-600">
            No player scores found for this range.
          </p>
        ) : (
          <div className="space-y-4">
            {topPlayers.map((player, index) => (
              <div key={player.entry_id} className="border-b pb-3 last:border-b-0">
                <div className="font-semibold">
                  {index + 1}. {player.display_name} — {player.total_points} pts
                </div>

                <div className="text-sm text-gray-600">
                  {player.exact_scores} correct scores · {player.correct_results} correct results
                  {selectedLeague === 'All' && player.league_name ? ` · ${player.league_name}` : ''}
                </div>

                {player.fixtures.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {player.fixtures.map((fixture: any, i: number) => (
                      <li key={i}>
                        {fixture.exact_score ? 'Exact score' : 'Correct result'} on{' '}
                        {fixture.fixture} — predicted {fixture.prediction} ({fixture.points} pts)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}