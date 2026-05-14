import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <section className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-4xl font-bold mb-3">
          World Cup 2026 Predictor Game
        </h1>

        <p className="mb-6 text-gray-700">
          Enter your match predictions, track your scores, and follow the league table as the tournament unfolds.
        </p>

        <h2 className="text-xl font-bold mb-3">
          Rules
        </h2>

        <ul className="space-y-2 text-sm text-gray-700 mb-6">
          <li><strong>Predictions:</strong> enter a score for each fixture before it locks.</li>
          <li><strong>Blank predictions:</strong> blanks score 0 once the match has locked.</li>
          <li><strong>Scoring:</strong> points are calculated using the full scoring matrix from the original spreadsheet.</li>
          <li><strong>Locking:</strong> each fixture locks individually at its deadline.</li>
          <li><strong>League table:</strong> standings update automatically once results are entered.</li>
        </ul>

        <div className="flex flex-wrap gap-3">
          <Link href="/fixtures" className="rounded border px-4 py-2 text-sm">
            View Fixtures
          </Link>

          <Link href="/predictions" className="rounded border px-4 py-2 text-sm">
            Enter Predictions
          </Link>

          <Link href="/standings" className="rounded border px-4 py-2 text-sm">
            View Standings
          </Link>

          <Link href="/login" className="rounded border px-4 py-2 text-sm">
            Login / Register
          </Link>
        </div>
      </section>
    </main>
  )
}