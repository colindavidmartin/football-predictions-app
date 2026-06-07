'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResultStatsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { data, error } = await supabase
      .from('result_prediction_stats')
      .select('*')
      .order('kickoff_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setRows(data ?? [])
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-2">
        Result Statistics
      </h1>

      <p className="mb-4 text-sm text-gray-600">
        Comparison of actual results versus player predictions.
      </p>

      {message && (
        <p className="mb-4 text-red-600">
          {message}
        </p>
      )}

      <div className="overflow-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-200 text-black font-semibold">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Fixture</th>
                <th className="p-2 text-center">Predictions</th>
                <th className="p-2 text-center">Home Win %</th>
                <th className="p-2 text-center">Draw %</th>
<th className="p-2 text-center">Away Win %</th>
<th className="p-2 text-center">Prediction Split</th>
<th className="p-2 text-center">Result</th>
              <th className="p-2 text-center">Correct Score</th>
              <th className="p-2 text-center">Correct Result</th>
              <th className="p-2 text-center">Incorrect</th>
              <th className="p-2 text-center">Missing</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.fixture_id} className="border-t">
                <td className="p-2">
                  {new Date(row.kickoff_at).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                  })}
                </td>

                <td className="p-2">
                  {row.home_team} v {row.away_team}
                </td>

                    <td className="p-2 text-center">
                    {row.total_predictions}
                    </td>

                    <td className="p-2 text-center">
                    {row.total_predictions > 0
                        ? Math.round(
                            (row.home_win_predictions / row.total_predictions) * 100
                        )
                        : 0}
                    %
                    </td>

        <td className="p-2 text-center">
        {row.total_predictions > 0
            ? Math.round(
                (row.draw_predictions / row.total_predictions) * 100
            )
            : 0}
        %
        </td>

                <td className="p-2 text-center">
                {row.total_predictions > 0
                    ? Math.round(
                        (row.away_win_predictions / row.total_predictions) * 100
                    )
                    : 0}
                %
                </td>

<td className="p-2">
  <div className="flex h-3 w-32 overflow-hidden rounded bg-gray-200">
    <div
      className="bg-blue-500"
      style={{
        width: `${
          row.total_predictions > 0
            ? Math.round((row.home_win_predictions / row.total_predictions) * 100)
            : 0
        }%`,
      }}
    />

    <div
      className="bg-gray-500"
      style={{
        width: `${
          row.total_predictions > 0
            ? Math.round((row.draw_predictions / row.total_predictions) * 100)
            : 0
        }%`,
      }}
    />

    <div
      className="bg-red-500"
      style={{
        width: `${
          row.total_predictions > 0
            ? Math.round((row.away_win_predictions / row.total_predictions) * 100)
            : 0
        }%`,
      }}
    />
  </div>
</td>

                    <td className="p-2 text-center font-bold">
                    {row.result_home_goals}-{row.result_away_goals}
                    </td>

                <td className="p-2 text-center">
                  {row.correct_score_count}
                </td>

                <td className="p-2 text-center">
                  {row.correct_result_count}
                </td>

                <td className="p-2 text-center">
                  {row.incorrect_count}
                </td>

                <td className="p-2 text-center">
                  {row.no_prediction_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}