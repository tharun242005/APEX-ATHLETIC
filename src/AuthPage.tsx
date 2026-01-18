import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabaseClient'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-800/70 backdrop-blur rounded-2xl p-8 border border-white/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Apex Athletic</h1>
          <p className="text-slate-300 mt-1">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</p>
          <div className="mt-3">
            <button onClick={() => (window.location.href = '/')} className="text-sm text-cyan-300 hover:underline">
              ← Back to Home
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${mode === 'login' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'}`}
          >
            Log In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${mode === 'signup' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-200 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-900/50 border border-white/10 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-slate-200 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-900/50 border border-white/10 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-xs text-slate-400">PROTOTYPE BY THARUN.P</span>
        </div>
      </motion.div>
    </div>
  )
}


