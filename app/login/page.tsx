'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const worldCupTeams = [
'Algeria',    'Argentina','Australia',  'Austria','Belgium',    'Bosnia and Herzegovina',
'Brazil',     'Cabo Verde','Canada',     'Colombia','Congo DR',   'Cote d-Ivoire','Croatia',    'Curacao','Czechia',    'Ecuador','Egypt',      'England','France',     'Germany','Ghana',      'Haiti','IR Iran',    'Iraq','Japan',      'Jordan',
'Korea Republic','Mexico',     'Morocco','Netherlands',    'New Zealand',
'Norway',     'Panama','Paraguay',   'Portugal','Qatar',      'Saudi Arabia','Scotland',   'Senegal',
'South Africa','Spain',      'Sweden','Switzerland',  'Tunisia','Turkiye','Uruguay','USA',    'Uzbekistan'
]

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [leagueName, setLeagueName] = useState('')
  const [supportedTeam, setSupportedTeam] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    window.location.href = '/predictions'
  }

  async function handleSignup() {
    if (!leagueName) {
      setMessage('Please select which league you are entering.')
      return
    }

    if (!supportedTeam) {
      setMessage('Please select your primary team.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: displayName || email,
        email: email,
        league_name: leagueName,
        supported_team: supportedTeam,
        department: department,
        competition_type: competitionType,
      })
    }

    setMessage('Account created. You can now log in.')
    setMode('login')
  }

  async function handleForgotPassword() {
    if (!email) {
      setMessage('Please enter your email address first.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Password reset email sent.')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold">
          {mode === 'login' ? 'Log in' : 'Create account'}
        </h1>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode('login')}
            className={`rounded px-3 py-2 text-sm ${
              mode === 'login'
                ? 'bg-black text-white'
                : 'border border-gray-300 bg-white text-black'
            }`}
          >
            Log in
          </button>

          <button
            onClick={() => setMode('signup')}
            className={`rounded px-3 py-2 text-sm ${
              mode === 'signup'
                ? 'bg-black text-white'
                : 'border border-gray-300 bg-white text-black'
            }`}
          >
            Sign up
          </button>
        </div>

        <div className="space-y-3">
          {mode === 'signup' && (
            <>
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded border border-gray-300 p-3 text-black"
              />

              <select
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                className="w-full rounded border border-gray-300 p-3 text-black"
              >
                <option value="">Which league are you entering?</option>
                <option value="Ideagen">Ideagen League</option>
                <option value="DJH (Derby)">DJH League</option>
                <option value="Family">Family League</option>
              </select>

              <select
                value={supportedTeam}
                onChange={(e) => setSupportedTeam(e.target.value)}
                className="w-full rounded border border-gray-300 p-3 text-black"
              >
                <option value="">
                  Primary team you are supporting at this year&apos;s World Cup
                </option>

                {worldCupTeams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 p-3 text-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 p-3 text-black"
          />

          {mode === 'signup' && (
  <p className="text-xs text-gray-600">
    This is a private invitation-only competition. Your display name will be
    visible to other participants in league tables and statistics, but your
    email address and personal information will never be shared with other
    users.
  </p>
)}

          <button
            onClick={mode === 'login' ? handleLogin : handleSignup}
            className="w-full rounded bg-black p-3 text-white"
          >
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          {mode === 'login' && (
            <button
              onClick={handleForgotPassword}
              className="w-full text-sm text-blue-700 underline"
            >
              Forgotten password?
            </button>
          )}

          {message && (
            <p className="text-sm text-blue-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}