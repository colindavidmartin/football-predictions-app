import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <section className="mx-auto max-w-3xl rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-4xl font-bold mb-3">
          Predictor Game - 2026/27 Season
        </h1>

        <p className="mb-6 text-gray-700">
          Enter your match predictions, track your scores, and follow the league table as the season unfolds.
        </p>


        <ul className="space-y-2 text-sm text-gray-700 mb-6">
          <li><strong><u>General rules:</u></strong></li> 
          <li>  +Predictions competition for weekly round of fixtures </li>
          
          <li>  +To enter simply register on the signup page - complete your name, add an email address and password </li>
          <li>  +Enter Prediction, and save for each game / or save all predictions. Predictions for each game must be submitted by 1 minute before KO for each game – we will try and send a reminder outs (but its your responsibility to remember)</li>
          <li>  +Predictions are for 90 minutes score</li>
          <li>  +No changes can be made to predictions after KO, but you can change/amend a prediction whenever your want before KO </li>
          <li>  +Entries are restricted to one per person </li>
          <li>  +Judges decision is final </li>
        
          <li><strong><u>Scoring Points:</u></strong></li> 
          <li><strong>Correct Result:</strong> 7 points for a draw, 4 points for a win to either side	</li>
          <li><strong>Correct Score:</strong>	additional 5 points if correct result and score, 		
						with additional 1 point per goal scored by each side</li>
          <li><strong>  or,</strong> additional 2 points if  correct result and score by one team,			
			with 1 point per goal scored by that team 	</li>
          
          <li><strong> Examples:</strong></li>
          <li>Result:	1 - 0, if Prediction:	1 - 0, then	Pts Scored:	10, allocated for	4 points for win to one side, plus 5 points for correct result and score, plus 1 point per goal</li>
          <li>Result:	2 - 1, if	Prediction:	2 - 0, then	Pts Scored:	8, allocated for 4 points for win to one side, plus 2 points for correct result and score by one team, plus 1 point (2) per goal</li>
          <li>Result:	3 - 0, if	Prediction:	2 - 0, then	Pts Scored:	6, allocated for 4 points for win to one side, plus 2 points for correct result and score by one team</li>
          <li>Result:	1 - 1, if	Prediction:	1 - 1, then	Pts Scored:	14,	allocated for 7 points for a draw, plus 5 points for correct result and score, plus 1 point (2) per goal</li>
          <li>Result:	1 - 1, if	Prediction:	2 - 2, then	Pts Scored:	7, allocated 7 points for a draw</li>
        

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

          <Link
          href="/prediction-stats"
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
        >
          Prediction Stats
        </Link>

          <Link href="/login" className="rounded border px-4 py-2 text-sm">
            Login / Register
          </Link>
        </div>
      </section>
    </main>
  )
}