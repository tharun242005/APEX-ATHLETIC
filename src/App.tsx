import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Zap, Activity, BarChart3, Users, Linkedin, Github } from 'lucide-react'
import LiveDemo from './LiveDemo'
import UploadPage from './UploadPage'
import { supabase } from './lib/supabaseClient'
import DashboardLayout from './components/dashboard/DashboardLayout'

// Constellation: glowing dots + faint connecting lines
function ConstellationLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const starsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; r: number; a: number }>>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.floor((w * h) / 14000)
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.6 + 0.6,
        a: Math.random() * 0.6 + 0.2
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const step = () => {
      const { innerWidth: w, innerHeight: h } = window
      const ctx2 = canvas.getContext('2d')
      if (!ctx2) return
      ctx2.clearRect(0, 0, w, h)

      const stars = starsRef.current
      // connections
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          const dist = Math.hypot(dx, dy)
          if (dist < 120) {
            const o = (120 - dist) / 120
            ctx2.beginPath()
            ctx2.moveTo(stars[i].x, stars[i].y)
            ctx2.lineTo(stars[j].x, stars[j].y)
            ctx2.strokeStyle = `rgba(139, 92, 246, ${0.14 * o})`
            ctx2.lineWidth = 1
            ctx2.stroke()
          }
        }
      }

      // stars
      for (let s of stars) {
        s.x += s.vx
        s.y += s.vy
        if (s.x < 0) s.x = w
        if (s.x > w) s.x = 0
        if (s.y < 0) s.y = h
        if (s.y > h) s.y = 0
        s.a += (Math.random() - 0.5) * 0.02
        const alpha = Math.max(0.15, Math.min(0.9, s.a))

        ctx2.beginPath()
        ctx2.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2)
        ctx2.fillStyle = `rgba(139, 92, 246, ${alpha * 0.12})`
        ctx2.fill()

        ctx2.beginPath()
        ctx2.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx2.fillStyle = `rgba(255,255,255, ${alpha})`
        ctx2.fill()
      }

      rafRef.current = requestAnimationFrame(step)
    }

    step()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 w-full h-full" />
}

// Aurora / nebula blobs
function AuroraLayer() {
  const base = { filter: 'blur(60px)', opacity: 0.5 } as const
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full"
        style={{ ...base, width: 600, height: 600, background: 'radial-gradient(circle at 30% 30%, #8B5CF6 0%, rgba(139,92,246,0) 60%)' }}
        animate={{ x: ["-10%", "10%", "-5%"], y: ["-5%", "10%", "-10%"], rotate: [0, 10, -8, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ ...base, width: 700, height: 700, background: 'radial-gradient(circle at 70% 60%, #22c55e 0%, rgba(34,197,94,0) 60%)' }}
        animate={{ x: ["20%", "-15%", "10%"], y: ["15%", "-10%", "5%"], rotate: [0, -6, 12, 0] }}
        transition={{ duration: 36, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ ...base, width: 800, height: 800, background: 'radial-gradient(circle at 50% 50%, #06b6d4 0%, rgba(6,182,212,0) 60%)' }}
        animate={{ x: ["-15%", "5%", "-10%"], y: ["10%", "-5%", "15%"], rotate: [0, 8, -10, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// Footer inside this file
function FooterInline() {
  return (
    <footer className="relative z-10 border-t border-white/10" style={{ background: 'rgba(7,10,22,0.65)', backdropFilter: 'blur(10px)' }}>
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-3">Apex Athletic</h3>
          <p className="text-sm text-slate-300/80">Pushing human performance forward with AI-powered analysis.</p>
        </div>
        <nav className="flex md:justify-center gap-6 text-slate-300/90">
          <a className="hover:text-white transition-colors" href="#home">Home</a>
          
          <a className="hover:text-white transition-colors" href="mailto:run40081@gmail.com">Contact</a>
        </nav>
        <div className="flex md:justify-end gap-4">
          <motion.a href="https://www.linkedin.com/in/tharun-p-4146b4318/" target="_blank" rel="noreferrer" whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20">
            <Linkedin className="w-5 h-5" />
          </motion.a>
          <motion.a href="https://github.com/tharun242005" target="_blank" rel="noreferrer" whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20">
            <Github className="w-5 h-5" />
          </motion.a>
        </div>
      </div>
      <div className="text-center text-xs text-slate-400/80 pb-6">© 2025 Apex Athletic. All rights reserved by THARUN P from AlgoNomad</div>
    </footer>
  )
}

// Small inline SVG logo (constellation-styled "A")
function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Apex Athletic logo">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#g)"/>
      {/* constellation A */}
      <g stroke="white" strokeOpacity="0.85" strokeWidth="2" fill="none" filter="url(#glow)">
        <path d="M16 48 L32 16 L48 48" />
        <path d="M22 36 L42 36" />
      </g>
      {/* star nodes */}
      <g fill="#ffffff">
        <circle cx="32" cy="16" r="2.2"/>
        <circle cx="16" cy="48" r="2"/>
        <circle cx="48" cy="48" r="2"/>
        <circle cx="22" cy="36" r="1.7"/>
        <circle cx="42" cy="36" r="1.7"/>
      </g>
    </svg>
  )
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'hero' | 'upload' | 'demo'>('hero')
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setIsAuthed(!!data.session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setIsAuthed(!!session))
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  if (isAuthed) return <DashboardLayout />
  if (currentPage === 'upload') return <UploadPage onBack={() => setCurrentPage('hero')} />
  if (currentPage === 'demo') return <LiveDemo onBack={() => setCurrentPage('hero')} />

  return (
    <div className="relative min-h-screen" style={{ fontFamily: 'Inter, Poppins, system-ui, sans-serif' }}>
      {/* Base cosmic gradient */}
      <div className="fixed inset-0 -z-30" style={{
        background: 'linear-gradient(135deg, #0b1020 0%, #17123a 45%, #0b1020 100%)'
      }} />

      {/* Aurora/nebula */}
      <AuroraLayer />

      {/* Constellations */}
      <ConstellationLayer />

      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-20 border-b border-white/10" style={{ background: 'rgba(7,10,22,0.35)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-bold text-white">Apex Athletic</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-200/80">
            
            <a className="hover:text-white transition-colors" href="#">AlgoNomad</a>
            <a className="hover:text-white transition-colors" href="mailto:run40081@gmail.com">Contact</a>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-6xl text-center">
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
            style={{ color: '#fff' }}
          >
            Unleash Your <span style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>Apex</span> Potential
          </motion.h1>
          <motion.p className="text-lg md:text-2xl text-slate-200/90 mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
            Upload a clip. Get your stats. Get discovered.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-8 justify-center mb-14" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(34,197,94,0.45)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentPage('upload')}
              className="px-10 py-5 rounded-2xl font-bold text-lg inline-flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#0b1020' }}
            >
              <Camera className="w-6 h-6" /> Analyze My Video (still in beta)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 36px rgba(139,92,246,0.45)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentPage('demo')}
              className="px-10 py-5 rounded-2xl font-bold text-lg inline-flex items-center justify-center gap-3 border-2"
              style={{ borderColor: '#8B5CF6', color: '#8B5CF6', background: 'transparent' }}
            >
              <Zap className="w-6 h-6" /> Try Live Demo
            </motion.button>
          </motion.div>

          {/* Feature badges */}
          <motion.div className="flex flex-col sm:flex-row gap-10 justify-center items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {[
              { icon: Activity, text: 'Instant Analysis' },
              { icon: BarChart3, text: 'Pro-Level Metrics' },
              { icon: Users, text: 'Scout Ready' },
            ].map(({ icon: Icon, text }) => (
              <motion.div key={text} whileHover={{ scale: 1.05 }} className="flex items-center gap-4 text-slate-200/90">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)' }}>
                  <Icon className="w-7 h-7" style={{ color: '#8B5CF6' }} />
                </div>
                <span className="text-base md:text-lg font-semibold">{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <FooterInline />
    </div>
  )
}