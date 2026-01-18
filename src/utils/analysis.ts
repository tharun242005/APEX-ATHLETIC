import type { Keypoint } from '@tensorflow-models/pose-detection'

export interface AnalysisData {
  timestamp: number
  kneeAngle?: number
  hipAngle?: number
  ankleAngle?: number
  shoulderAngle?: number
  elbowAngle?: number
}

export interface DrillResults {
  drillType: 'squat' | 'pushup'
  totalFrames: number
  flexibility?: number
  power?: number
  stability?: number
  score: number
  feedback: string[]
}

/**
 * Calculate the angle between three keypoints (in degrees)
 */
export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  if (!a.score || !b.score || !c.score || a.score < 0.3 || b.score < 0.3 || c.score < 0.3) {
    return 0
  }

  const vectorAB = {
    x: a.x - b.x,
    y: a.y - b.y
  }
  
  const vectorCB = {
    x: c.x - b.x,
    y: c.y - b.y
  }

  const dotProduct = vectorAB.x * vectorCB.x + vectorAB.y * vectorCB.y
  const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y)
  const magnitudeCB = Math.sqrt(vectorCB.x * vectorCB.x + vectorCB.y * vectorCB.y)

  if (magnitudeAB === 0 || magnitudeCB === 0) {
    return 0
  }

  const cosAngle = dotProduct / (magnitudeAB * magnitudeCB)
  const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle))
  const angleRadians = Math.acos(clampedCosAngle)
  const angleDegrees = angleRadians * (180 / Math.PI)

  return angleDegrees
}

/**
 * Base class for pose analysis
 */
export abstract class BaseAnalyzer {
  protected frameCount = 0
  protected startTime = 0
  protected keypointHistory: Keypoint[][] = []
  protected smoothingFactor = 0.3 // For exponential moving average

  constructor() {
    this.startTime = Date.now()
  }

  /**
   * Smooth keypoints using exponential moving average
   */
  protected smoothKeypoints(keypoints: Keypoint[]): Keypoint[] {
    if (this.keypointHistory.length === 0) {
      this.keypointHistory.push(keypoints)
      return keypoints
    }

    const lastKeypoints = this.keypointHistory[this.keypointHistory.length - 1]
    const smoothedKeypoints = keypoints.map((keypoint, index) => {
      const lastKeypoint = lastKeypoints[index]
      if (!lastKeypoint || !keypoint.score || keypoint.score < 0.3) {
        return keypoint
      }

      return {
        ...keypoint,
        x: lastKeypoint.x + this.smoothingFactor * (keypoint.x - lastKeypoint.x),
        y: lastKeypoint.y + this.smoothingFactor * (keypoint.y - lastKeypoint.y)
      }
    })

    this.keypointHistory.push(smoothedKeypoints)
    
    // Keep only last 10 frames for memory efficiency
    if (this.keypointHistory.length > 10) {
      this.keypointHistory.shift()
    }

    return smoothedKeypoints
  }

  /**
   * Process keypoints for analysis
   */
  abstract processKeypoints(keypoints: Keypoint[]): AnalysisData

  /**
   * Get final results
   */
  abstract getResults(): DrillResults

  /**
   * Reset analyzer state
   */
  reset(): void {
    this.frameCount = 0
    this.startTime = Date.now()
    this.keypointHistory = []
  }
}

/**
 * Squat Analysis Class
 */
export class SquatAnalyzer extends BaseAnalyzer {
  private minKneeAngle = 180
  private maxHipAngle = 0
  private stabilityVariance = 0
  private hipPositions: number[] = []

  processKeypoints(keypoints: Keypoint[]): AnalysisData {
    this.frameCount++
    const smoothedKeypoints = this.smoothKeypoints(keypoints)
    
    const data: AnalysisData = {
      timestamp: Date.now()
    }

    // Keypoint indices for MoveNet
    const leftHip = smoothedKeypoints[11]
    const leftKnee = smoothedKeypoints[13]
    const leftAnkle = smoothedKeypoints[15]

    // Calculate knee angles (flexibility)
    if (leftHip && leftKnee && leftAnkle) {
      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle)
      data.kneeAngle = leftKneeAngle
      
      // Track minimum knee angle for flexibility score
      if (leftKneeAngle > 0) {
        this.minKneeAngle = Math.min(this.minKneeAngle, leftKneeAngle)
      }
    }

    // Calculate hip angles (stability)
    if (leftKnee && leftHip && smoothedKeypoints[5]) { // Left shoulder as reference
      const leftHipAngle = calculateAngle(leftKnee, leftHip, smoothedKeypoints[5])
      data.hipAngle = leftHipAngle
      
      // Track hip angle for stability analysis
      this.maxHipAngle = Math.max(this.maxHipAngle, leftHipAngle)
      this.hipPositions.push(leftHipAngle)
      
      // Calculate stability variance
      if (this.hipPositions.length > 10) {
        this.hipPositions.shift()
      }
      
      if (this.hipPositions.length > 5) {
        const avgHipAngle = this.hipPositions.reduce((sum, angle) => sum + angle, 0) / this.hipPositions.length
        const variance = this.hipPositions.reduce((sum, angle) => sum + Math.pow(angle - avgHipAngle, 2), 0) / this.hipPositions.length
        this.stabilityVariance = variance
      }
    }

    return data
  }

  getResults(): DrillResults {
    // Calculate flexibility score (0-100) based on minimum knee angle
    // Lower knee angle = better flexibility
    const flexibilityScore = Math.max(0, Math.min(100, (180 - this.minKneeAngle) * 2))
    
    // Calculate stability score (0-100) based on hip stability
    // Lower variance = better stability
    const stabilityScore = Math.max(0, Math.min(100, 100 - (this.stabilityVariance * 2)))
    
    // Calculate power score based on depth and control
    const powerScore = Math.max(0, Math.min(100, (flexibilityScore + stabilityScore) / 2))
    
    const avgScore = (flexibilityScore + stabilityScore + powerScore) / 3
    const feedback: string[] = []

    // Generate feedback based on scores
    if (this.minKneeAngle < 90) {
      feedback.push("Excellent squat depth! Your flexibility is outstanding.")
    } else if (this.minKneeAngle < 110) {
      feedback.push("Good squat depth. Try to go a bit deeper for better results.")
    } else {
      feedback.push("Focus on achieving deeper squats to improve flexibility.")
    }

    if (stabilityScore > 80) {
      feedback.push("Great stability throughout the movement!")
    } else if (stabilityScore > 60) {
      feedback.push("Good stability. Work on maintaining consistent form.")
    } else {
      feedback.push("Focus on maintaining a stable core during squats.")
    }

    if (powerScore > 80) {
      feedback.push("Excellent power and control in your squats!")
    } else {
      feedback.push("Keep practicing to improve your squat power and control.")
    }

    return {
      drillType: 'squat',
      totalFrames: this.frameCount,
      flexibility: Math.round(flexibilityScore),
      power: Math.round(powerScore),
      stability: Math.round(stabilityScore),
      score: Math.round(avgScore),
      feedback
    }
  }
}

/**
 * Push-up Analysis Class
 */
export class PushupAnalyzer extends BaseAnalyzer {
  private maxElbowAngle = 0
  private hipVelocities: number[] = []
  private elbowAngles: number[] = []
  private lastHipY = 0
  private lastFrameTime = 0

  processKeypoints(keypoints: Keypoint[]): AnalysisData {
    this.frameCount++
    const smoothedKeypoints = this.smoothKeypoints(keypoints)
    
    const data: AnalysisData = {
      timestamp: Date.now()
    }

    // Keypoint indices for MoveNet
    const leftShoulder = smoothedKeypoints[5]
    const leftElbow = smoothedKeypoints[7]
    const leftWrist = smoothedKeypoints[9]
    const leftHip = smoothedKeypoints[11]

    // Calculate elbow angles (power)
    if (leftShoulder && leftElbow && leftWrist) {
      const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist)
      data.elbowAngle = elbowAngle
      
      // Track maximum elbow angle for power analysis
      this.maxElbowAngle = Math.max(this.maxElbowAngle, elbowAngle)
      this.elbowAngles.push(elbowAngle)
      
      if (this.elbowAngles.length > 20) {
        this.elbowAngles.shift()
      }
    }

    // Calculate hip velocity (explosive power)
    if (leftHip && this.lastFrameTime > 0) {
      const currentTime = Date.now()
      const deltaTime = (currentTime - this.lastFrameTime) / 1000 // Convert to seconds
      
      if (deltaTime > 0) {
        const hipVelocity = (this.lastHipY - leftHip.y) / deltaTime
        this.hipVelocities.push(hipVelocity)
        
        if (this.hipVelocities.length > 20) {
          this.hipVelocities.shift()
        }
      }
      
      this.lastHipY = leftHip.y
      this.lastFrameTime = currentTime
    } else if (leftHip) {
      this.lastHipY = leftHip.y
      this.lastFrameTime = Date.now()
    }

    return data
  }

  getResults(): DrillResults {
    // Calculate power score (0-100) based on maximum elbow angle
    // Higher elbow angle = better power (deeper push-up)
    const powerScore = Math.max(0, Math.min(100, this.maxElbowAngle * 0.8))
    
    // Calculate explosive power based on hip velocity variance
    const avgHipVelocity = this.hipVelocities.length > 0 
      ? this.hipVelocities.reduce((sum, vel) => sum + Math.abs(vel), 0) / this.hipVelocities.length 
      : 0
    const explosivePowerScore = Math.max(0, Math.min(100, avgHipVelocity * 10))
    
    // Calculate stability based on elbow angle consistency
    const elbowVariance = this.elbowAngles.length > 1 
      ? this.calculateVariance(this.elbowAngles) 
      : 0
    const stabilityScore = Math.max(0, Math.min(100, 100 - (elbowVariance * 5)))
    
    const avgScore = (powerScore + explosivePowerScore + stabilityScore) / 3
    const feedback: string[] = []

    // Generate feedback based on scores
    if (this.maxElbowAngle > 120) {
      feedback.push("Excellent push-up depth! Your power is outstanding.")
    } else if (this.maxElbowAngle > 100) {
      feedback.push("Good push-up depth. Try to go deeper for better results.")
    } else {
      feedback.push("Focus on achieving deeper push-ups to improve power.")
    }

    if (explosivePowerScore > 70) {
      feedback.push("Great explosive power in your push-ups!")
    } else {
      feedback.push("Work on generating more explosive power during the upward phase.")
    }

    if (stabilityScore > 80) {
      feedback.push("Excellent stability and control throughout the movement!")
    } else if (stabilityScore > 60) {
      feedback.push("Good stability. Focus on maintaining consistent form.")
    } else {
      feedback.push("Work on maintaining a stable body position during push-ups.")
    }

    return {
      drillType: 'pushup',
      totalFrames: this.frameCount,
      flexibility: Math.round(stabilityScore), // Using stability as flexibility metric
      power: Math.round(powerScore),
      stability: Math.round(stabilityScore),
      score: Math.round(avgScore),
      feedback
    }
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    
    return variance
  }
}

/**
 * Factory function to create appropriate analyzer
 */
export function createAnalyzer(drillType: 'squat' | 'pushup'): BaseAnalyzer {
  switch (drillType) {
    case 'squat':
      return new SquatAnalyzer()
    case 'pushup':
      return new PushupAnalyzer()
    default:
      throw new Error(`Unknown drill type: ${drillType}`)
  }
}

// ==========================
// Dashboard analyzers (sports-specific)
// ==========================
// duplicate type import removed

export interface DashboardResults {
  drillType: 'basketball_free_throw' | 'cricket_bowling' | 'soccer_penalty' | 'tennis_serve'
  score: number
  metrics: Record<string, number>
}

export interface DashboardAnalyzer {
  processFrame(keypoints: Keypoint[]): void
  getResults(): DashboardResults
}

class BaseDashboardAnalyzer implements DashboardAnalyzer {
  protected frames = 0
  protected metricSum: Record<string, number> = {}
  protected metricCounts: Record<string, number> = {}
  protected readonly drill: DashboardResults['drillType']
  constructor(drill: DashboardResults['drillType']) {
    this.drill = drill
  }

  processFrame(_keypoints: Keypoint[]): void {
    this.frames++
    // placeholder metric accumulation
    this.addMetric('stability', Math.random() * 100)
    this.addMetric('power', Math.random() * 100)
    this.addMetric('accuracy', Math.random() * 100)
  }

  protected addMetric(name: string, value: number) {
    this.metricSum[name] = (this.metricSum[name] ?? 0) + value
    this.metricCounts[name] = (this.metricCounts[name] ?? 0) + 1
  }

  getResults(): DashboardResults {
    const metrics: Record<string, number> = {}
    Object.keys(this.metricSum).forEach((k) => {
      const avg = this.metricSum[k] / Math.max(1, this.metricCounts[k])
      metrics[k] = Math.round(avg)
    })
    const entries = Object.values(metrics)
    const score = entries.length ? Math.round(entries.reduce((a, b) => a + b, 0) / entries.length) : 0
    return { drillType: this.drill, score, metrics }
  }
}

export class BasketballFreeThrowAnalyzer extends BaseDashboardAnalyzer {
  constructor() { super('basketball_free_throw') }
}

export class CricketBowlingAnalyzer extends BaseDashboardAnalyzer {
  constructor() { super('cricket_bowling') }
}

export class SoccerPenaltyAnalyzer extends BaseDashboardAnalyzer {
  constructor() { super('soccer_penalty') }
}

export class TennisServeAnalyzer extends BaseDashboardAnalyzer {
  constructor() { super('tennis_serve') }
}

export function createDashboardAnalyzer(
  drill: 'basketball_free_throw' | 'cricket_bowling' | 'soccer_penalty' | 'tennis_serve'
): DashboardAnalyzer {
  switch (drill) {
    case 'basketball_free_throw':
      return new BasketballFreeThrowAnalyzer()
    case 'cricket_bowling':
      return new CricketBowlingAnalyzer()
    case 'soccer_penalty':
      return new SoccerPenaltyAnalyzer()
    case 'tennis_serve':
      return new TennisServeAnalyzer()
  }
}
