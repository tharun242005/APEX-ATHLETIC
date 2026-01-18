import { useEffect, useRef, useState } from 'react'

import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import { createDashboardAnalyzer, type DashboardAnalyzer, type DashboardResults } from '../../utils/analysis'

export default function LiveAnalysis() {
  type Drill = 'basketball_free_throw' | 'cricket_bowling' | 'soccer_penalty' | 'tennis_serve'
  type Status = 'selecting' | 'countdown' | 'running' | 'results'

  const [drill, setDrill] = useState<Drill | null>(null)
  const [status, setStatus] = useState<Status>('selecting')
  const [countdown, setCountdown] = useState(5)
  const [results, setResults] = useState<DashboardResults | null>(null)
  const [model, setModel] = useState<poseDetection.PoseDetector | null>(null)
  const [analyzer, setAnalyzer] = useState<DashboardAnalyzer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [framesProcessed, setFramesProcessed] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [detectionErrors, setDetectionErrors] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const videoReadyRef = useRef<boolean>(false)

  const colors = {
    primary: '#1e40af',
    secondary: '#dc2626',
    accent: '#f59e0b',
    success: '#10b981',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    muted: '#64748b'
  }

  // Simple skeleton drawing function
  const drawSkeleton = (keypoints: poseDetection.Keypoint[], ctx: CanvasRenderingContext2D) => {
    if (!ctx) {
      console.error('No canvas context available')
      return
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw keypoints
    keypoints.forEach((keypoint) => {
      if (keypoint.score && keypoint.score > 0.3) {
        ctx.beginPath()
        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI)
        ctx.fillStyle = '#10b981'
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Draw skeleton connections
    const connections = [
      [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
      [5, 11], [6, 12], [11, 12],
      [11, 13], [13, 15], [12, 14], [14, 16]
    ]

    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'

    connections.forEach(([startIdx, endIdx]) => {
      const startPoint = keypoints[startIdx]
      const endPoint = keypoints[endIdx]

      if (startPoint && endPoint && startPoint.score && endPoint.score && 
          startPoint.score > 0.3 && endPoint.score > 0.3) {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.stroke()
      }
    })
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
   
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoReadyRef.current = false
    }
  }

  // Load model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('Loading TensorFlow model...')
        setDebugInfo('Loading pose detection model...')
        
        await tf.setBackend('webgl')
        await tf.ready()
        
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { 
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true
          }
        )
        
        setModel(detector)
        setIsModelLoaded(true)
        console.log('Model loaded successfully')
        setDebugInfo('Model loaded - ready for analysis')
      } catch (err) {
        console.error('Error loading model:', err)
        setError('Failed to load pose detection model. Please refresh the page.')
      }
    }

    loadModel()
  }, [])

  // Start analysis immediately when status changes to running
  useEffect(() => {
    if (status === 'running') {
      startAnalysis()
    }
  }, [status])

  const startAnalysis = async () => {
    console.log('=== STARTING ANALYSIS ===')
    setDebugInfo('Starting camera...')
    setDetectionErrors(0)

    // Ensure canvas is ready
    if (!canvasRef.current) {
      console.error('Canvas not available')
      setError('Canvas not available. Please refresh and try again.')
      setStatus('selecting')
      return
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) {
      setError('Could not get canvas context')
      setStatus('selecting')
      return
    }

    // Set canvas dimensions immediately
    canvasRef.current.width = 640
    canvasRef.current.height = 480
    console.log('Canvas dimensions set:', canvasRef.current.width, canvasRef.current.height)

    try {
      // Start webcam
      console.log('Starting webcam...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Use a more reliable way to wait for video to be ready
        const video = videoRef.current
        await new Promise((resolve) => {
          const onLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata)
            resolve(true)
          }
          
          if (video.readyState >= 3) { // HAVE_FUTURE_DATA or greater
            resolve(true)
          } else {
            video.addEventListener('loadedmetadata', onLoadedMetadata)
            // Fallback timeout
            setTimeout(() => resolve(true), 1000)
          }
        })

        // Start playing the video
        await video.play().catch(err => {
          console.warn('Video play warning:', err)
          // Continue anyway even if play is interrupted
        })
        
        videoReadyRef.current = true
        console.log('Video ready and playing')
        setDebugInfo('Camera active - detecting poses...')
        setError(null)
        
        // Start detection immediately
        runDetection()
      }

    } catch (err) {
      console.error('Error starting webcam:', err)
      setError('Unable to access camera. Please ensure camera permissions are granted.')
      setStatus('selecting')
    }
  }

  // Robust detection loop with error handling
  const runDetection = async () => {
    if (status !== 'running' || !model || !videoRef.current || !canvasRef.current) {
      return
    }

    // Check if video is ready and has frames
    if (!videoReadyRef.current || videoRef.current.readyState !== 4) {
      // Try again next frame with a shorter delay
      if (status === 'running') {
        setTimeout(() => {
          rafRef.current = requestAnimationFrame(runDetection)
        }, 100)
      }
      return
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) {
      console.error('Canvas context lost during detection')
      return
    }

    try {
      const poses = await model.estimatePoses(videoRef.current, {
        maxPoses: 1,
        flipHorizontal: false
      }).catch(err => {
        console.warn('Pose detection error, continuing:', err)
        setDetectionErrors(prev => prev + 1)
        return []
      })

      if (poses.length > 0 && poses[0].keypoints) {
        // Draw the skeleton
        drawSkeleton(poses[0].keypoints, ctx)

        // Process with analyzer
        if (analyzer) {
          analyzer.processFrame(poses[0].keypoints)
        }
        
        setFramesProcessed(prev => prev + 1)
        setDebugInfo(`Frames: ${framesProcessed + 1}, Poses: ${poses.length}, Errors: ${detectionErrors}`)
      } else {
        // Clear canvas if no pose detected
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        setDebugInfo(`Frames: ${framesProcessed + 1}, No poses, Errors: ${detectionErrors}`)
      }
    } catch (err) {
      console.error('Error in detection loop:', err)
      setDetectionErrors(prev => prev + 1)
      setDebugInfo(`Detection error ${detectionErrors + 1}, continuing...`)
      
      // Clear canvas on error
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }

    // Continue the loop with error threshold
    if (status === 'running' && detectionErrors < 10) {
      rafRef.current = requestAnimationFrame(runDetection)
    } else if (detectionErrors >= 10) {
      setError('Too many detection errors. Please refresh and try again.')
      setStatus('selecting')
    }
  }

  // Countdown effect
  useEffect(() => {
    if (status !== 'countdown') return

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setStatus('running')
          return 5
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  const stopAll = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    stopWebcam()
  }

  const handleSelect = (d: Drill) => {
    if (!isModelLoaded) {
      setError('Pose detection model is still loading. Please wait...')
      return
    }
    
    setDrill(d)
    setAnalyzer(createDashboardAnalyzer(d))
    setStatus('countdown')
    setCountdown(5)
    setError(null)
    setFramesProcessed(0)
    setDebugInfo('')
    setDetectionErrors(0)
  }

  const finish = () => {
    stopAll()
    if (analyzer) {
      const results = analyzer.getResults()
      setResults(results)
    }
    setStatus('results')
  }

  const handleReset = () => {
    stopAll()
    setStatus('selecting')
    setDrill(null)
    setResults(null)
    setError(null)
    setFramesProcessed(0)
    setDebugInfo('')
    setDetectionErrors(0)
  }

  // Generate AI tips based on results
  const generateAITips = (results: DashboardResults): string[] => {
    const tips: string[] = []
    const flexibility = results.metrics.flexibility || 0
    const power = results.metrics.power || 0
    const stability = results.metrics.stability || 0
    const avgScore = (flexibility + power + stability) / 3

    // General performance tips
    if (avgScore >= 90) {
      tips.push("Outstanding performance! Your technique is excellent across all metrics.")
      tips.push("Consider adding advanced variations to challenge yourself further.")
      tips.push("You're ready for competitive-level training and drills.")
    } else if (avgScore >= 80) {
      tips.push("Great job! You're performing well overall with room for improvement.")
      tips.push("Focus on your weakest area to reach the next level.")
      tips.push("Consistent practice will help you achieve elite performance.")
    } else if (avgScore >= 70) {
      tips.push("Good foundation! There's significant room for improvement.")
      tips.push("Focus on proper form and technique before increasing intensity.")
      tips.push("Consider working with a coach for personalized guidance.")
    } else {
      tips.push("Keep practicing! Focus on proper form and gradual progression.")
      tips.push("Start with basic exercises to build a solid foundation.")
      tips.push("Consider consulting a trainer for personalized guidance.")
    }

    // Specific metric-based tips
    if (flexibility < 70) {
      tips.push("Work on flexibility exercises to improve your range of motion.")
    }
    if (power < 70) {
      tips.push("Incorporate explosive training exercises to build power.")
    }
    if (stability < 70) {
      tips.push("Practice balance and core stability exercises regularly.")
    }

    // Drill-specific tips
    if (drill === 'basketball_free_throw') {
      tips.push("Focus on consistent shooting form and follow-through.")
      tips.push("Practice your routine to build muscle memory.")
    } else if (drill === 'cricket_bowling') {
      tips.push("Work on your run-up rhythm and delivery stride.")
      tips.push("Focus on maintaining balance throughout your action.")
    } else if (drill === 'soccer_penalty') {
      tips.push("Practice your approach and follow-through technique.")
      tips.push("Work on maintaining composure under pressure.")
    } else if (drill === 'tennis_serve') {
      tips.push("Focus on your toss consistency and service motion.")
      tips.push("Work on generating power from your legs and core.")
    }

    return tips.slice(0, 4) // Limit to 4 tips
  }

  // Minimal JSX to close component and reference state/handlers
  return (
    <div className="min-h-screen bg-slate-900 p-4 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-sm text-slate-400">Status: {status}</div>
        {error && <div className="p-3 rounded bg-red-500/20 text-red-300">{error}</div>}
        {!!debugInfo && <div className="text-slate-400 text-sm">{debugInfo}</div>}
        <div style={{ display: 'none', color: colors.primary }}>{String(!!model)}</div>

        {status === 'selecting' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Select a drill</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <button onClick={() => handleSelect('basketball_free_throw')} className="p-3 rounded bg-slate-800">Basketball Free Throw</button>
              <button onClick={() => handleSelect('cricket_bowling')} className="p-3 rounded bg-slate-800">Cricket Bowling</button>
              <button onClick={() => handleSelect('soccer_penalty')} className="p-3 rounded bg-slate-800">Soccer Penalty</button>
              <button onClick={() => handleSelect('tennis_serve')} className="p-3 rounded bg-slate-800">Tennis Serve</button>
            </div>
            {drill && <div className="text-slate-300 text-sm">Selected: {drill}</div>}
          </div>
        )}

        {status === 'countdown' && (
          <div className="text-center space-y-2">
            <div className="text-6xl font-black">{countdown}</div>
            <div className="text-slate-400">Get in position...</div>
          </div>
        )}

        {status === 'running' && (
          <div className="space-y-4">
            <div className="text-sm text-slate-400">Frames: {framesProcessed}</div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <video ref={videoRef} className="w-full" autoPlay muted playsInline />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={finish} className="px-4 py-2 rounded bg-red-600 text-white">Stop & Analyze</button>
              <button onClick={handleReset} className="px-4 py-2 rounded bg-slate-700">Reset</button>
            </div>
          </div>
        )}

        {status === 'results' && results && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Performance Report</h2>
              <p className="text-lg" style={{ color: colors.muted }}>Your {drill?.replace('_', ' ')} Analysis Results</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border-2" style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.primary
              }}>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
                    {results.metrics.flexibility || 0}/100
                  </div>
                  <div className="text-lg font-semibold mb-1" style={{ color: colors.text }}>Flexibility</div>
                  <div className="text-sm" style={{ color: colors.muted }}>Range of Motion</div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border-2" style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.secondary
              }}>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: colors.secondary }}>
                    {results.metrics.power || 0}/100
                  </div>
                  <div className="text-lg font-semibold mb-1" style={{ color: colors.text }}>Power</div>
                  <div className="text-sm" style={{ color: colors.muted }}>Explosive Strength</div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border-2" style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.accent
              }}>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{ color: colors.accent }}>
                    {results.metrics.stability || 0}/100
                  </div>
                  <div className="text-lg font-semibold mb-1" style={{ color: colors.text }}>Stability</div>
                  <div className="text-sm" style={{ color: colors.muted }}>Balance & Control</div>
                </div>
              </div>
            </div>

            {/* AI Generated Tips */}
            <div className="p-6 rounded-2xl border-2" style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.success
            }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                     style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <svg className="w-6 h-6" style={{ color: colors.success }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
                    AI Generated Tips
                  </h3>
                  <div className="space-y-3">
                    {generateAITips(results).map((tip, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-1" 
                             style={{ backgroundColor: colors.success, color: colors.text }}>
                          {index + 1}
                        </div>
                        <p style={{ color: colors.muted }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleReset} 
                className="px-8 py-4 rounded-full text-lg font-bold transition-all duration-200"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.text,
                  boxShadow: `0 0 20px ${colors.primary}40`
                }}
              >
                Analyze Again
              </button>
              <button 
                onClick={() => window.history.back()}
                className="px-8 py-4 rounded-full text-lg font-bold border-2 transition-all duration-200"
                style={{ 
                  borderColor: colors.secondary,
                  color: colors.secondary,
                  backgroundColor: 'transparent'
                }}
              >
                Back to Dashboard
              </button>
              <button 
                className="px-8 py-4 rounded-full text-lg font-bold border-2 transition-all duration-200"
                style={{ 
                  borderColor: colors.accent,
                  color: colors.accent,
                  backgroundColor: 'transparent'
                }}
              >
                Save Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}