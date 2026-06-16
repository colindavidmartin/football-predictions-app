export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const params = await searchParams
  const view = params?.view ?? 'group'

  const { data: fixtures, error } = await supabase
    .from('fixtures')
    .select('*')
    .order(view === 'date' ? 'kickoff_at' : 'group_name')
    .order('kickoff_at')

  const groupedFixtures = (fixtures ?? []).reduce((groups: any, fixture) => {
    const group = fixture.group_name ?? 'Other'

    if (!groups[group]) {
      groups[group] = []
    }

    groups[group].push(fixture)

    return groups
  }, {})

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-4">
        World Cup 2026 Fixtures
      </h1>

      <div className="mb-6 flex gap-3">
        <Link
          href="/fixtures?view=group"
          className={`rounded px-4 py-2 text-sm ${
            view === 'group'
              ? 'bg-black text-white'
              : 'border bg-white text-black'
          }`}
        >
          By Group
        </Link>

        <Link
          href="/fixtures?view=date"
          className={`rounded px-4 py-2 text-sm ${
            view === 'date'
              ? 'bg-black text-white'
              : 'border bg-white text-black'
          }`}
        >
          By Date
        </Link>
      </div>

      {error && (
        <pre className="mb-6 text-red-500">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {view === 'group' && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(groupedFixtures).map(([group, matches]: any) => (
            <section
              key={group}
              className="border rounded-xl shadow-sm overflow-hidden bg-white"
            >
              <h2 className="bg-gray-200 px-4 py-2 font-bold text-black">
                {group}
              </h2>

              <div className="divide-y">
                {matches.map((fixture: any) => (
                  <div key={fixture.id} className="p-3">
                    <div className="flex justify-between text-[10px] text-black mb-1">
                      <span>
                        {fixture.home_team} vs {fixture.away_team}
                      </span>

                      <span>
                        {new Date(fixture.kickoff_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          timeZone: 'UTC',
                        })}{' '}
                        {new Date(fixture.kickoff_at).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                          timeZone: 'UTC',
                        })}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500">
                      {fixture.location}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {view === 'date' && (
        <div className="rounded-xl border bg-white overflow-hidden">
  {fixtures?.map((fixture: any) => (
    <div
      key={fixture.id}
      className="flex items-center justify-between border-b px-3 py-2 text-[10px] md:text-[12px] lg:text-[14px]"
    >
      <div className="w-32 text-gray-700">
        {new Date(fixture.kickoff_at).toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          timeZone: 'UTC',
        })}{' '}
        {new Date(fixture.kickoff_at).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        })}
      </div>

      <div className="flex-1 px-4 font-medium text-black">
        {fixture.home_team} vs {fixture.away_team}
      </div>

      <div className="w-48 text-right text-gray-500 text-[8px] md:text-[10px] lg:text-[12px]">
  {fixture.location}
</div>
    </div>
  ))}
</div>
      )}
    </main>
  )
}