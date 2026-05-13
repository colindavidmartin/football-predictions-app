export const dynamic = 'force-dynamic'

import { supabase } from '../../lib/supabase'


export default async function StandingsPage() {
  const { data: competition } = await supabase
    .from('competitions')
    .select('*')
    .limit(1)
    .single()

  const { data: standings, error } = await supabase
    .from('league_table')
    .select('*')
    .eq('competition_id', competition.id)
    .order('total_points', { ascending: false })
    .order('exact_scores', { ascending: false })
    .order('correct_results', { ascending: false })

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-2">
        League Table
      </h1>

      <p className="mb-4 text-sm text-gray-600">
        Standings update when results are entered.
      </p>

      {error && (
        <pre className="mb-4 text-red-500 text-sm">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      <div className="overflow-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 sticky top-0 z-10 text-black font-semibold">
            <tr>
              <th className="p-2 text-left">Pos</th>
              <th className="p-2 text-left">Player</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-right">Pts</th>
              <th className="p-2 text-right">Exact</th>
              <th className="p-2 text-right">Results</th>
            </tr>
          </thead>

          <tbody>
            {standings?.map((row, index) => (
              <tr key={row.entry_id} className="border-t">
                <td className="p-2">{index + 1}</td>
                <td className="p-2 font-medium">{row.display_name}</td>
                <td className="p-2">{row.department ?? ''}</td>
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