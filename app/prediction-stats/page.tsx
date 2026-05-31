export const dynamic = 'force-dynamic'

import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default async function PredictionStatsPage() {
  const { data: fixtures, error } = await supabase
    .from('prediction_outcome_stats')
    .select('*')
    .order('kickoff_at')

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-2">
        Prediction Stats
      </h1>

      <p className="mb-6 text-sm text-gray-600">
        See how players are predicting each fixture.
      </p>

      {error && (
        <pre className="mb-6 text-red-500 text-sm">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <div className="rounded-xl border bg-white overflow-hidden">
        {fixtures?.map((fixture: any) => {
            if ((fixture.total_predictions ?? 0) < 1) {
            return null
            }
          const total = fixture.total_predictions ?? 0
          const homeWins = fixture.home_win_predictions ?? 0
          const draws = fixture.draw_predictions ?? 0
          const awayWins = fixture.away_win_predictions ?? 0

          const pct = (count: number) =>
            total === 0 ? '0%' : `${Math.round((count / total) * 100)}%`

          return (
            <div
              key={fixture.fixture_id}
              className="border-b px-3 py-2 text-[10px] md:text-[12px] lg:text-[14px]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="w-36 text-gray-700">
                  {new Date(fixture.kickoff_at).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                  })}{' '}
                  {new Date(fixture.kickoff_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </div>

                <div className="flex-1 font-medium text-black">
                  {fixture.home_team} vs {fixture.away_team}
                </div>

                <div className="w-52 text-right text-gray-500 text-[8px] md:text-[10px] lg:text-[12px]">
                  {fixture.location}
                </div>
              </div>

              <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[10px] md:text-[12px]">
                <div className="rounded bg-gray-100 p-2">
                  <div className="font-semibold">{total}</div>
                  <div className="text-gray-500">Predictions</div>
                </div>

                <div className="rounded bg-gray-100 p-2">
                  <div className="font-semibold">
                    {homeWins} ({pct(homeWins)})
                  </div>
                  <div className="text-gray-500">{fixture.home_team} win</div>
                </div>

                <div className="rounded bg-gray-100 p-2">
                  <div className="font-semibold">
                    {draws} ({pct(draws)})
                  </div>
                  <div className="text-gray-500">Draw</div>
                </div>

                <div className="rounded bg-gray-100 p-2">
                  <div className="font-semibold">
                    {awayWins} ({pct(awayWins)})
                  </div>
                  <div className="text-gray-500">{fixture.away_team} win</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <Link href="/" className="text-sm text-blue-700 underline">
          Back to home
        </Link>
      </div>
    </main>
  )
}