import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConstellationAnimation from './components/ConstellationAnimation'
import BackgroundAnimation from './components/BackgroundAnimation'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import { createAnalyzer } from './utils/analysis.ts'
import type { AnalysisData, BaseAnalyzer } from './utils/analysis.ts'

interface LiveDemoProps {
  onBack?: () => void
}

type DemoStatus = 'idle' | 'selecting_drill' | 'countdown' | 'running' | 'calculating' | 'results'

type DrillType = 'squat' | 'pushup'

function LiveDemo({ onBack }: LiveDemoProps) {
  const [status, setStatus] = useState<DemoStatus>('idle')
  const [selectedDrill, setSelectedDrill] = useState<DrillType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<poseDetection.PoseDetector | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([])
  const [metrics, setMetrics] = useState<{
    flexibility: number
    power: number
    stability: number
  } | null>(null)
  const [analyzer, setAnalyzer] = useState<BaseAnalyzer | null>(null)
  const [countdown, setCountdown] = useState(10)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Purple neon theme to match homepage + constellation
  const colors = {
    primary: '#8B5CF6', // purple-500
    secondary: '#A855F7', // purple-600
    accent: '#00F5D4', // cyan neon accent
    success: '#22c55e',
    background: '#120a23',
    surface: '#1e1b4b',
    text: '#FFFFFF',
    muted: '#A7A9BE'
  }

  // Helper function to draw keypoints and skeleton
  const drawSkeleton = (keypoints: poseDetection.Keypoint[], ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw keypoints
    keypoints.forEach((keypoint) => {
      if (keypoint.score && keypoint.score > 0.3) {
        ctx.beginPath()
        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI)
        ctx.fillStyle = colors.success
        ctx.fill()
        ctx.strokeStyle = colors.text
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Draw skeleton connections using MoveNet pose connections
    const connections = [
      [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // arms
      [5, 11], [6, 12], [11, 12], // shoulders and torso
      [11, 13], [13, 15], [12, 14], [14, 16], // legs
      [5, 11], [6, 12], [11, 12] // torso connections
    ]

    ctx.strokeStyle = colors.success
    ctx.lineWidth = 4
    ctx.lineCap = 'round'

    connections.forEach(([startIdx, endIdx]) => {
      const startPoint = keypoints[startIdx]
      const endPoint = keypoints[endIdx]

      if (startPoint && endPoint && 
          startPoint.score && endPoint.score && 
          startPoint.score > 0.3 && endPoint.score > 0.3) {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.stroke()
      }
    })
  }

  // Stop webcam function
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  // Start webcam and detection when status changes to running
  useEffect(() => {
    const startAnalysis = async () => {
      if (status !== 'running' || !selectedDrill) return

      try {
        // Load model if not already loaded
        if (!model) {
          await tf.ready()
          const detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
              modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            }
          )
          setModel(detector)
        }

        // Start webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        })

        streamRef.current = stream

        // Set video source
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }

        // Set canvas dimensions to match video
        if (canvasRef.current && videoRef.current) {
          canvasRef.current.width = 640
          canvasRef.current.height = 480
        }

        // Reset analysis data
        setAnalysisData([])
        setError(null)
      } catch (err) {
        console.error('Error starting analysis:', err)
        setError('Unable to start camera. Please ensure camera permissions are granted.')
        setStatus('selecting_drill')
      }
    }

    startAnalysis()
  }, [status, selectedDrill, model])

  // Pose detection loop - only runs when status is 'running'
  useEffect(() => {
    const detectPose = async () => {
      if (status !== 'running' || !model || !videoRef.current || !canvasRef.current || !analyzer) {
        return
      }

      try {
        const poses = await model.estimatePoses(videoRef.current)
        
        if (poses.length > 0 && poses[0].keypoints) {
          // Process keypoints with analyzer (includes smoothing)
          const frameData = analyzer.processKeypoints(poses[0].keypoints)
          
          // Draw smoothed skeleton
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            drawSkeleton(poses[0].keypoints, ctx)
          }

          // Store analysis data
          setAnalysisData(prev => [...prev, frameData])
        } else if (canvasRef.current) {
          // Clear canvas if no pose detected
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          }
        }
      } catch (err) {
        console.error('Error detecting pose:', err)
      }

      // Continue the loop only if still running
      if (status === 'running') {
        animationFrameRef.current = requestAnimationFrame(detectPose)
      }
    }

    if (status === 'running') {
      detectPose()
    } else {
      // Stop animation frame when not running
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [status, model, analyzer])

  // Countdown timer effect
  useEffect(() => {
    if (status !== 'countdown') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setStatus('running')
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  // Button handlers
  const handleDrillSelect = (drill: DrillType) => {
    setSelectedDrill(drill)
    setStatus('selecting_drill')
    setError(null)
  }

  const handleStartDrill = () => {
    if (!selectedDrill) return
    
    // Create analyzer instance
    const analyzerInstance = createAnalyzer(selectedDrill)
    setAnalyzer(analyzerInstance)
    
    // Reset countdown and start countdown
    setCountdown(10)
    setStatus('countdown')
    setError(null)
  }

  const handleStopAndAnalyze = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop webcam
    stopWebcam()

    // Calculate results using analyzer
    if (analyzer) {
      const drillResults = analyzer.getResults()
      
      // Set metrics for display
      setMetrics({
        flexibility: drillResults.flexibility || 0,
        power: drillResults.power || 0,
        stability: drillResults.stability || 0
      })
      
      // Log results to console
      console.log('=== DRILL ANALYSIS RESULTS ===')
      console.log('Drill Type:', drillResults.drillType)
      console.log('Total Frames:', drillResults.totalFrames)
      console.log('Score:', drillResults.score)
      console.log('Metrics:', {
        flexibility: drillResults.flexibility,
        power: drillResults.power,
        stability: drillResults.stability
      })
      console.log('Feedback:', drillResults.feedback)
    }

    setStatus('results')
  }

  const handleReset = () => {
    setStatus('idle')
    setSelectedDrill(null)
    setAnalysisData([])
    setMetrics(null)
    setAnalyzer(null)
    setCountdown(10)
    setError(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      stopWebcam()
    }
  }, [])

  // ResultsScreen Component
  const ResultsScreen = () => {
    const [animatedValues, setAnimatedValues] = useState({
      flexibility: 0,
      power: 0,
      stability: 0
    })

    // Animate the metrics counting up
    useEffect(() => {
      if (!metrics) return

      const duration = 2000 // 2 seconds
      const steps = 60
      const stepDuration = duration / steps

      const animateValue = (start: number, end: number, setter: (value: number) => void) => {
        let current = start
        const increment = (end - start) / steps
        const timer = setInterval(() => {
          current += increment
          if (current >= end) {
            current = end
            clearInterval(timer)
          }
          setter(Math.round(current))
        }, stepDuration)
      }

      // Start animations with slight delays
      setTimeout(() => animateValue(0, metrics.flexibility, (val) => 
        setAnimatedValues(prev => ({ ...prev, flexibility: val }))), 200)
      setTimeout(() => animateValue(0, metrics.power, (val) => 
        setAnimatedValues(prev => ({ ...prev, power: val }))), 400)
      setTimeout(() => animateValue(0, metrics.stability, (val) => 
        setAnimatedValues(prev => ({ ...prev, stability: val }))), 600)
    }, [metrics])

    // Generate AI tip based on metrics
    const generateAITip = () => {
      if (!metrics) return "Keep up the great work!"

      const avgScore = (metrics.flexibility + metrics.power + metrics.stability) / 3
      
      if (avgScore >= 90) {
        return "Outstanding performance! Your form is excellent across all metrics. Consider adding advanced variations to challenge yourself further."
      } else if (avgScore >= 80) {
        return "Great job! You're performing well overall. Focus on your weakest area to reach the next level."
      } else if (avgScore >= 70) {
        return "Good foundation! There's room for improvement. Consider working on flexibility and stability exercises."
      } else {
        return "Keep practicing! Focus on proper form and gradual progression. Consider consulting a trainer for personalized guidance."
      }
    }

    const CircularProgress = ({ value, max, color, label }: { 
      value: number, 
      max: number, 
      color: string, 
      label: string 
    }) => {
      const radius = 60
      const strokeWidth = 8
      const normalizedRadius = radius - strokeWidth * 2
      const circumference = normalizedRadius * 2 * Math.PI
      const strokeDasharray = `${circumference} ${circumference}`
      const strokeDashoffset = circumference - (value / max) * circumference

      return (
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg
              height={radius * 2}
              width={radius * 2}
              className="transform -rotate-90"
            >
              <circle
                stroke={colors.surface}
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: colors.text }}>
                {animatedValues[label.toLowerCase() as keyof typeof animatedValues]}
              </span>
            </div>
          </div>
          <span className="text-sm font-semibold mt-2" style={{ color: colors.muted }}>
            {label}
          </span>
        </div>
      )
    }

    return (
      <motion.div
        key="results"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.success }}
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: colors.text }}>
            Performance Report
          </h2>
          <p className="text-xl" style={{ color: colors.muted }}>
            {selectedDrill === 'squat' ? 'Squat Analysis Complete' : 'Push-up Test Complete'}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CircularProgress
              value={metrics?.flexibility || 0}
              max={100}
              color={colors.primary}
              label="Flexibility"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CircularProgress
              value={metrics?.power || 0}
              max={100}
              color={colors.secondary}
              label="Power"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CircularProgress
              value={metrics?.stability || 0}
              max={100}
              color={colors.accent}
              label="Stability"
            />
          </motion.div>
        </div>

        {/* AI Generated Tip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <div className="p-8 rounded-2xl border-2"
               style={{ 
                 backgroundColor: colors.surface,
                 borderColor: colors.accent
               }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: colors.accent }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
                  AI Generated Tip
                </h3>
                <p className="text-lg leading-relaxed" style={{ color: colors.muted }}>
                  {generateAITip()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analyze Again CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <motion.button
            onClick={handleReset}
            className="px-12 py-4 rounded-full text-xl font-bold transition-colors duration-200"
            style={{ 
              backgroundColor: colors.primary,
              color: colors.text
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Analyze Again
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Global starfield + particles */}
      <ConstellationAnimation className="fixed inset-0 -z-10" />
      <BackgroundAnimation className="fixed inset-0 -z-20" blur={false} intensity="high" sportsTheme={true} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        {onBack && (
          <motion.button
            onClick={onBack}
            className="absolute top-8 left-8 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            style={{ backgroundColor: colors.surface, color: colors.text }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
        )}

        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: colors.text }}>
            APEX ATHLETIC
          </h1>
          <p className="text-xl" style={{ color: colors.muted }}>
            Professional Sports Performance Analysis
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="text-center mb-8 p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${colors.secondary}20`, 
                borderColor: `${colors.secondary}30`,
                color: colors.secondary
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                  Welcome to APEX ATHLETIC
                </h2>
                <p className="text-lg" style={{ color: colors.muted }}>
                  Choose your performance test to begin analysis
                </p>
              </div>

              <motion.button
                onClick={() => setStatus('selecting_drill')}
                className="px-12 py-4 rounded-full text-xl font-bold transition-colors duration-200"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.text
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select Drill
              </motion.button>
            </motion.div>
          )}

          {status === 'selecting_drill' && (
            <motion.div
              key="selecting"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                  Select Your Drill
                </h2>
                <p className="text-lg" style={{ color: colors.muted }}>
                  Choose a performance test to analyze your form
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Squat Analysis Card */}
                <motion.div
                  className="p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.primary,
                    color: colors.text
                  }}
                  whileHover={{ scale: 1.05, borderColor: colors.accent }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDrillSelect('squat')}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: colors.primary }}>
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Squat Analysis</h3>
                    <p className="text-lg mb-6" style={{ color: colors.muted }}>
                      Analyze your squat depth, knee angles, and hip mobility for optimal lower body strength
                    </p>
                    <div className="flex justify-center">
                      <span className="px-4 py-2 rounded-full text-sm font-semibold"
                            style={{ backgroundColor: colors.success, color: colors.text }}>
                        Lower Body Focus
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Push-up Power Test Card */}
                <motion.div
                  className="p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.secondary,
                    color: colors.text
                  }}
                  whileHover={{ scale: 1.05, borderColor: colors.accent }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDrillSelect('pushup')}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: colors.secondary }}>
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Push-up Power Test</h3>
                    <p className="text-lg mb-6" style={{ color: colors.muted }}>
                      Test your upper body strength and analyze elbow angles, shoulder stability, and core engagement
                    </p>
                    <div className="flex justify-center">
                      <span className="px-4 py-2 rounded-full text-sm font-semibold"
                            style={{ backgroundColor: colors.accent, color: colors.text }}>
                        Upper Body Focus
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Start Drill Button */}
              {selectedDrill && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8"
                >
                  <motion.button
                    onClick={handleStartDrill}
                    className="px-8 py-4 rounded-full text-lg font-bold transition-colors duration-200"
                    style={{ 
                      backgroundColor: colors.success,
                      color: colors.text
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start {selectedDrill === 'squat' ? 'Squat' : 'Push-up'} Analysis
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {status === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mb-12">
                <motion.div
                  className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.accent }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="text-6xl font-bold" style={{ color: colors.text }}>
                    {countdown}
                  </span>
                </motion.div>
                <h2 className="text-4xl font-bold mb-4" style={{ color: colors.text }}>
                  Get in Position
                </h2>
                <p className="text-xl" style={{ color: colors.muted }}>
                  Analysis will begin shortly...
                </p>
                <p className="text-lg mt-4" style={{ color: colors.muted }}>
                  {selectedDrill === 'squat' ? 'Squat Analysis' : 'Push-up Power Test'}
                </p>
                
                {/* Instructions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 max-w-2xl mx-auto"
                >
                  <div className="p-6 rounded-2xl border-2" style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.accent
                  }}>
                    <h3 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
                      Instructions
                    </h3>
                    {selectedDrill === 'squat' ? (
                      <div className="space-y-3 text-left">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" 
                               style={{ backgroundColor: colors.primary, color: colors.text }}>
                            1
                          </div>
                          <p style={{ color: colors.muted }}>
                            Stand with feet shoulder-width apart, toes slightly pointed out
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" 
                               style={{ backgroundColor: colors.primary, color: colors.text }}>
                            2
                          </div>
                          <p style={{ color: colors.muted }}>
                            Lower your body by bending at the hips and knees
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" 
                               style={{ backgroundColor: colors.primary, color: colors.text }}>
                            3
                          </div>
                          <p style={{ color: colors.muted }}>
                            Go down until your thighs are parallel to the floor
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" 
                               style={{ backgroundColor: colors.primary, color: colors.text }}>
                            4
                          </div>
                          <p style={{ color: colors.muted }}>
                            Push through your heels to return to starting position
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 text-left">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" 
                               style={{ backgroundColor: colors.secondary, color: colors.text }}>
                            1
                          </div>
                          <p style={{ color: colors.muted }}>
                            Start in a plank position with hands slightly wider than shoulders
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" 
                               style={{ backgroundColor: colors.secondary, color: colors.text }}>
                            2
                          </div>
                          <p style={{ color: colors.muted }}>
                            Lower your chest toward the ground, keeping body straight
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" 
                               style={{ backgroundColor: colors.secondary, color: colors.text }}>
                            3
                          </div>
                          <p style={{ color: colors.muted }}>
                            Push up explosively to return to starting position
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" 
                               style={{ backgroundColor: colors.secondary, color: colors.text }}>
                            4
                          </div>
                          <p style={{ color: colors.muted }}>
                            Maintain proper form throughout the movement
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {status === 'running' && (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                  {selectedDrill === 'squat' ? 'Squat Analysis' : 'Push-up Power Test'}
                </h2>
                <p className="text-lg" style={{ color: colors.muted }}>
                  Perform your drill while we analyze your form in real-time
                </p>
              </div>

              {/* HUD-style Video Container */}
              <div className="relative mx-auto max-w-4xl">
                <div className="relative rounded-2xl overflow-hidden border-4"
                     style={{ 
                       borderColor: colors.accent,
                       boxShadow: `0 0 30px ${colors.accent}40`
                     }}>
                  {/* Video Element */}
                  <video
                    ref={videoRef}
                    className="w-full"
                    autoPlay
                    muted
                    playsInline
                  />
                  
                  {/* Canvas Overlay */}
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ mixBlendMode: 'normal' }}
                  />

                  {/* HUD Overlay Elements */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg"
                       style={{ backgroundColor: `${colors.background}90` }}>
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors.success }}></div>
                    <span className="text-sm font-bold" style={{ color: colors.text }}>LIVE</span>
                  </div>

                  <div className="absolute top-4 right-4 px-3 py-2 rounded-lg"
                       style={{ backgroundColor: `${colors.background}90` }}>
                    <span className="text-sm font-bold" style={{ color: colors.text }}>
                      Frames: {analysisData.length}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 px-3 py-2 rounded-lg"
                       style={{ backgroundColor: `${colors.background}90` }}>
                    <span className="text-sm font-bold" style={{ color: colors.text }}>
                      {selectedDrill === 'squat' ? 'Squat Analysis' : 'Push-up Test'}
                    </span>
                  </div>
                </div>

                {/* Control Button */}
                <div className="text-center mt-8">
                  <motion.button
                    onClick={handleStopAndAnalyze}
                    className="px-8 py-4 rounded-full text-lg font-bold transition-colors duration-200"
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: colors.text
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Stop & Analyze
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'results' && <ResultsScreen />}
        </AnimatePresence>
      </div>
      {/* Footer Badge */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none">
        <span className="px-4 py-2 rounded-full text-xs md:text-sm font-semibold tracking-widest"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: colors.text, border: '1px solid rgba(255,255,255,0.12)' }}>
          PROTOTYPE BY THARUN.P
        </span>
      </div>
    </div>
  )
}

export default LiveDemo