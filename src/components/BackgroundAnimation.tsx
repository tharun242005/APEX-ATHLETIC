import React, { useEffect, useRef, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  connections: number[]
  type: 'star' | 'nebula' | 'sport'
}

interface BackgroundAnimationProps {
  className?: string
  blur?: boolean
  intensity?: 'low' | 'medium' | 'high'
  sportsTheme?: boolean
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ 
  className = '', 
  blur = false,
  intensity = 'medium',
  sportsTheme = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Initialize particles based on intensity
    const particleCounts = { low: 20, medium: 40, high: 60 }
    const particleCount = particleCounts[intensity]
    
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => {
      const type = sportsTheme && Math.random() < 0.3 ? 'sport' : 
                   Math.random() < 0.7 ? 'star' : 'nebula'
      
      return {
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: type === 'star' ? Math.random() * 2 + 1 : 
              type === 'sport' ? Math.random() * 3 + 2 : Math.random() * 4 + 2,
        opacity: Math.random() * 0.8 + 0.2,
        connections: [],
        type
      }
    })

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)
      
      const particles = particlesRef.current
      const mouse = mouseRef.current

      // Update and draw particles
      particles.forEach((particle) => {
        // Mouse interaction
        const dx = mouse.x - particle.x
        const dy = mouse.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 150) {
          const force = (150 - distance) / 150
          particle.vx += (dx / distance) * force * 0.01
          particle.vy += (dy / distance) * force * 0.01
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > dimensions.width) particle.vx *= -0.8
        if (particle.y < 0 || particle.y > dimensions.height) particle.vy *= -0.8

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(dimensions.width, particle.x))
        particle.y = Math.max(0, Math.min(dimensions.height, particle.y))

        // Fade particles
        particle.opacity = Math.max(0.1, particle.opacity - 0.002)
        if (particle.opacity <= 0.1) {
          particle.opacity = Math.random() * 0.8 + 0.2
        }

        // Draw particle based on type
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        
        if (particle.type === 'star') {
          ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`
          ctx.shadowColor = '#8B5CF6'
          ctx.shadowBlur = 8
        } else if (particle.type === 'sport') {
          ctx.fillStyle = `rgba(0, 245, 212, ${particle.opacity})`
          ctx.shadowColor = '#00F5D4'
          ctx.shadowBlur = 12
        } else {
          ctx.fillStyle = `rgba(168, 85, 247, ${particle.opacity * 0.6})`
          ctx.shadowColor = '#A855F7'
          ctx.shadowBlur = 15
        }
        
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.3
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, intensity, sportsTheme])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${blur ? 'blur-sm' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        filter: blur ? 'blur(2px)' : 'none',
        opacity: blur ? 0.3 : 1
      }}
    />
  )
}

export default BackgroundAnimation
