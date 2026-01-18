import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabaseClient'
import AuthPage from './AuthPage'

interface UploadPageProps {
  onBack?: () => void
}

export default function UploadPage({ onBack }: UploadPageProps) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setIsAuthed(!!data.session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setIsAuthed(!!session)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (isAuthed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-300">Checking session…</div>
      </div>
    )
  }

  // Not logged in: render AuthPage inline
  if (!isAuthed) {
    return <AuthPage />
  }

  // Logged in: basic placeholder UI for file upload and drill selection
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-white">Upload & Analyze</h1>
          {onBack && (
            <motion.button
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100 border border-white/10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >Back</motion.button>
          )}
        </div>

        {/* Dropzone placeholder */}
        <div className="rounded-2xl border-2 border-dashed border-white/20 p-10 text-center bg-slate-800/50">
          <p className="text-slate-300 mb-2">Drag & drop your video here</p>
          <p className="text-slate-400 text-sm">or click to browse</p>
        </div>

        {/* Drill selection */}
        <div className="grid sm:grid-cols-2 gap-6 mt-10">
          <button className="p-6 rounded-xl bg-slate-800 text-slate-100 border border-white/10 hover:border-emerald-400 transition">
            Squat Analysis
          </button>
          <button className="p-6 rounded-xl bg-slate-800 text-slate-100 border border-white/10 hover:border-emerald-400 transition">
            Push-up Power Test
          </button>
        </div>

        <div className="mt-10">
          <motion.button
            className="px-8 py-3 rounded-full bg-emerald-500 text-white font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Analysis
          </motion.button>
        </div>

        <div className="text-center mt-12">
          <span className="text-xs text-slate-400">PROTOTYPE BY THARUN.P</span>
        </div>
      </div>
    </div>
  )
}


