'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function PredictionsPage() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [entryId, setEntryId] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Record<string, { home: string; away: string }>>({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPage()
  }, [])

 
  async function loadPage() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please log in first.')
      return
    }

    const { data: competition } = await supabase
      .from('competitions')
      .select('*')
      .limit(1)
      .single()

    if (!competition) {
      setMessage('No competition found.')
      return
    }

    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .upsert(
        {
          competition_id: competition.id,
          profile_id: user.id,
        },
        {
          onConflict: 'competition_id,profile_id',
        }
      )
      .select()
      .single()

    if (entryError) {
      setMessage(entryError.message)
      return
    }

    setEntryId(entry.id)

    const { data: fixtureRows } = await supabase
      .from('fixtures')
      .select(`
        *,
        prediction_scores (
          points,
          exact_score,
          correct_result
        )
      `)
      .eq('competition_id', competition.id)
      .eq('prediction_scores.entry_id', entry.id)
      .order('kickoff_at')

    setFixtures(fixtureRows ?? [])

    const { data: existingPredictions } = await supabase
      .from('predictions')
      .select('*')
      .eq('entry_id', entry.id)

    const map: Record<string, { home: string; away: string }> = {}

    existingPredictions?.forEach((prediction) => {
      map[prediction.fixture_id] = {
        home: String(prediction.predicted_home_goals),
        away: String(prediction.predicted_away_goals),
      }
    })

    setPredictions(map)
  }

  function updatePrediction(fixtureId: string, side: 'home' | 'away', value: string) {
    setPredictions((current) => ({
      ...current,
      [fixtureId]: {
        home: current[fixtureId]?.home ?? '',
        away: current[fixtureId]?.away ?? '',
        [side]: value,
      },
    }))
  }

  async function savePrediction(fixtureId: string) {
    if (!entryId) return

    const prediction = predictions[fixtureId]

    if (!prediction?.home || !prediction?.away) {
      setMessage('Enter both scores before saving.')
      return
    }

    const { error } = await supabase
      .from('predictions')
      .upsert(
        {
          entry_id: entryId,
          fixture_id: fixtureId,
          predicted_home_goals: Number(prediction.home),
          predicted_away_goals: Number(prediction.away),
        },
        {
          onConflict: 'entry_id,fixture_id',
        }
      )

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Prediction saved.')
    }
  }

async function saveAllPredictions() {
  if (!entryId) return

  const rows = fixtures
    .map((fixture) => {
      const prediction = predictions[fixture.id]

      if (!prediction?.home || !prediction?.away) {
        return null
      }

      const locked = new Date(fixture.lock_at) <= new Date()

      if (locked) {
        return null
      }

      return {
        entry_id: entryId,
        fixture_id: fixture.id,
        predicted_home_goals: Number(prediction.home),
        predicted_away_goals: Number(prediction.away),
      }
    })
    .filter((row): row is {
  entry_id: string
  fixture_id: string
  predicted_home_goals: number
  predicted_away_goals: number
} => row !== null)

  if (rows.length === 0) {
    setMessage('No unlocked completed predictions to save.')
    return
  }

  const { error } = await supabase
    .from('predictions')
    .upsert(rows, {
      onConflict: 'entry_id,fixture_id',
    })

  if (error) {
    setMessage(error.message)
  } else {
    setMessage(`Saved ${rows.length} predictions.`)
  }
  }
  const completedCount = fixtures.filter((fixture) => {
    const p = predictions[fixture.id]
    return p?.home !== undefined && p?.home !== '' && p?.away !== undefined && p?.away !== ''
  }).length
  const missingCount = fixtures.length - completedCount
  const hasMissingPredictions = missingCount > 0

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-2">
        Enter Predictions
      </h1>

        <p className="mb-2 text-sm text-gray-600">
        Predictions completed: {completedCount} / {fixtures.length} · Missing: {missingCount}
        </p>
        {hasMissingPredictions && (
        <p className="mb-4 text-sm text-yellow-700 font-medium">
        You still have missing predictions. Blank predictions will score 0 (zero) points once locked.
        </p>
        )}

        <button
        onClick={saveAllPredictions}
        className="mb-4 bg-black text-white rounded px-4 py-2 text-sm underline"
        >
        Save All Predictions
        </button>


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
              <th className="p-2 text-left">Rnd</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Group</th>
              <th className="p-2 text-right">Home</th>
              <th className="p-2 text-center">H</th>
              <th className="p-2 text-center">A</th>
              <th className="p-2 text-left">Away</th>
                  <th className="p-2 text-center">Actual</th>
                  <th className="p-2 text-center">Pts</th>
              <th className="p-2 text-left">Save</th>
            </tr>
          </thead>

          <tbody>
            {fixtures.map((fixture) => {
              const prediction = predictions[fixture.id]
              const missing = !prediction?.home || !prediction?.away
              const locked = new Date(fixture.lock_at) <= new Date()
              const completed = fixture.completed

              return (
                <tr
                  key={fixture.id}
                  className={`
                    border-t
                    ${completed ? 'bg-green-50' : ''}
                    ${!completed && missing ? 'bg-yellow-50' : ''}
                    ${locked && !completed ? 'bg-gray-100' : ''}
                    `}
                >
                  <td className="p-2">{fixture.match_number}</td>
                  <td className="p-2">{fixture.round_number}</td>

                  <td className="p-2">
                    {new Date(fixture.kickoff_at).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })}
                  </td>

                  <td className="p-2">
                    {new Date(fixture.kickoff_at).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </td>

                  <td className="p-2">{fixture.group_name}</td>

                  <td className="p-2 font-medium text-right">
                    {fixture.home_team}
                  </td>

                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      disabled={locked}
                      value={prediction?.home ?? ''}
                      onChange={(e) => updatePrediction(fixture.id, 'home', e.target.value)}
                      className="w-12 border rounded p-1 text-center"
                    />
                  </td>

                  <td className="p-1 text-center">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      disabled={locked}
                      value={prediction?.away ?? ''}
                      onChange={(e) => updatePrediction(fixture.id, 'away', e.target.value)}
                      className="w-12 border rounded p-1 text-center"
                    />
                  </td>

                  <td className="p-2 font-medium">
                    {fixture.away_team}
                  </td>

                      <td className="p-2 text-center">
                        {fixture.completed
                          ? `${fixture.result_home_goals}-${fixture.result_away_goals}`
                          : '-'}
                      </td>

                      <td className="p-2 text-center font-bold">
                        {fixture.completed
                          ? fixture.prediction_scores?.[0]?.points ?? 0
                          : '-'}
                      </td>

                  <td className="p-2">
                    <button
                    onClick={() => savePrediction(fixture.id)}
                    disabled={locked}
                    className="bg-black text-white rounded px-3 py-1 text-xs disabled:bg-gray-300 disabled:text-gray-600"
                    >
                    {completed ? 'Played' : locked ? 'Locked' : 'Save'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}