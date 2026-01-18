import type { Keypoint } from '@tensorflow-models/pose-detection'

export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  if (!a || !b || !c) return 0
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const magAB = Math.hypot(ab.x, ab.y)
  const magCB = Math.hypot(cb.x, cb.y)
  if (magAB === 0 || magCB === 0) return 0
  const cos = Math.max(-1, Math.min(1, dot / (magAB * magCB)))
  return Math.round((Math.acos(cos) * 180) / Math.PI)
}

export function calculateVelocity(prev: Keypoint | null, curr: Keypoint | null, dtMs: number): number {
  if (!prev || !curr || dtMs <= 0) return 0
  const dx = curr.x - prev.x
  const dy = curr.y - prev.y
  const dist = Math.hypot(dx, dy)
  // pixels per second
  return (dist / dtMs) * 1000
}

export interface LiveResults {
  flexibility: number
  power: number
  stability: number
}

abstract class BaseAnalyzer {
  protected frames = 0
  protected lastTimestamp = 0

  protected clampScore(v: number): number {
    return Math.max(0, Math.min(100, Math.round(v)))
  }

  abstract processFrame(keypoints: Keypoint[], timestamp?: number): void
  abstract getResults(): LiveResults
}

// Basketball Free Throw: track elbow angle range (form), wrist speed (power), stance sway (stability)
export class BasketballFreeThrowAnalyzer extends BaseAnalyzer {
  private elbowAngles: number[] = []
  private lastWrist: Keypoint | null = null
  private wristSpeeds: number[] = []
  private hipXHistory: number[] = []

  processFrame(keypoints: Keypoint[], timestamp: number = performance.now()): void {
    this.frames++

    const leftShoulder = keypoints[5]
    const leftElbow = keypoints[7]
    const leftWrist = keypoints[9]

    if (leftShoulder && leftElbow && leftWrist) {
      const elbow = calculateAngle(leftShoulder, leftElbow, leftWrist)
      if (elbow > 0) this.elbowAngles.push(elbow)

      if (this.lastTimestamp > 0) {
        const v = calculateVelocity(this.lastWrist, leftWrist, timestamp - this.lastTimestamp)
        if (v > 0) this.wristSpeeds.push(v)
      }
      this.lastWrist = leftWrist
    }

    const leftHip = keypoints[11]
    if (leftHip) {
      this.hipXHistory.push(leftHip.x)
      if (this.hipXHistory.length > 60) this.hipXHistory.shift()
    }

    this.lastTimestamp = timestamp
  }

  getResults(): LiveResults {
    // Flexibility: larger elbow travel (180 - min angle)
    const minElbow = this.elbowAngles.length ? Math.min(...this.elbowAngles) : 180
    const maxElbow = this.elbowAngles.length ? Math.max(...this.elbowAngles) : 180
    const elbowTravel = Math.max(0, maxElbow - minElbow)
    const flexibility = this.clampScore((elbowTravel / 90) * 100)

    // Power: peak wrist speed normalized
    const peakWrist = this.wristSpeeds.length ? Math.max(...this.wristSpeeds) : 0
    const power = this.clampScore(Math.min(100, peakWrist))

    // Stability: lower hip sway variance => higher score
    const meanX = this.hipXHistory.length ? this.hipXHistory.reduce((a, b) => a + b, 0) / this.hipXHistory.length : 0
    const variance = this.hipXHistory.length ? this.hipXHistory.reduce((s, x) => s + Math.pow(x - meanX, 2), 0) / this.hipXHistory.length : 0
    const stability = this.clampScore(100 - Math.min(100, variance * 0.1))

    return { flexibility, power, stability }
  }
}

// Cricket Bowling: track shoulder rotation (angle), wrist speed (power), head sway (stability)
export class CricketBowlingAnalyzer extends BaseAnalyzer {
  private shoulderAngles: number[] = []
  private lastWrist: Keypoint | null = null
  private wristSpeeds: number[] = []
  private headYHistory: number[] = []

  processFrame(keypoints: Keypoint[], timestamp: number = performance.now()): void {
    this.frames++

    const rightHip = keypoints[12]
    const rightShoulder = keypoints[6]
    const leftShoulder = keypoints[5]

    if (rightHip && rightShoulder && leftShoulder) {
      // Shoulder rotation relative to hip line
      const angle = calculateAngle(leftShoulder, rightShoulder, rightHip)
      if (angle > 0) this.shoulderAngles.push(angle)
    }

    const rightElbow = keypoints[8]
    const rightWrist = keypoints[10]
    if (rightElbow && rightWrist) {
      if (this.lastTimestamp > 0) {
        const v = calculateVelocity(this.lastWrist, rightWrist, timestamp - this.lastTimestamp)
        if (v > 0) this.wristSpeeds.push(v)
      }
      this.lastWrist = rightWrist
    }

    const nose = keypoints[0]
    if (nose) {
      this.headYHistory.push(nose.y)
      if (this.headYHistory.length > 60) this.headYHistory.shift()
    }

    this.lastTimestamp = timestamp
  }

  getResults(): LiveResults {
    const rotationRange = this.shoulderAngles.length ? (Math.max(...this.shoulderAngles) - Math.min(...this.shoulderAngles)) : 0
    const flexibility = this.clampScore((rotationRange / 90) * 100)

    const peakWrist = this.wristSpeeds.length ? Math.max(...this.wristSpeeds) : 0
    const power = this.clampScore(Math.min(100, peakWrist))

    const meanY = this.headYHistory.length ? this.headYHistory.reduce((a, b) => a + b, 0) / this.headYHistory.length : 0
    const variance = this.headYHistory.length ? this.headYHistory.reduce((s, y) => s + Math.pow(y - meanY, 2), 0) / this.headYHistory.length : 0
    const stability = this.clampScore(100 - Math.min(100, variance * 0.1))

    return { flexibility, power, stability }
  }
}

// Soccer Penalty: track knee flex (flexibility), hip-driven velocity (power), torso sway (stability)
export class SoccerPenaltyAnalyzer extends BaseAnalyzer {
  private kneeAngles: number[] = []
  private lastHip: Keypoint | null = null
  private hipSpeeds: number[] = []
  private torsoXHistory: number[] = []

  processFrame(keypoints: Keypoint[], timestamp: number = performance.now()): void {
    this.frames++

    const rightHip = keypoints[12]
    const rightKnee = keypoints[14]
    const rightAnkle = keypoints[16]

    if (rightHip && rightKnee && rightAnkle) {
      const knee = calculateAngle(rightHip, rightKnee, rightAnkle)
      if (knee > 0) this.kneeAngles.push(knee)
    }

    const leftHip = keypoints[11]
    if (leftHip) {
      if (this.lastTimestamp > 0) {
        const v = calculateVelocity(this.lastHip, leftHip, timestamp - this.lastTimestamp)
        if (v > 0) this.hipSpeeds.push(v)
      }
      this.lastHip = leftHip
    }

    const leftShoulder = keypoints[5]
    const rightShoulder = keypoints[6]
    if (leftShoulder && rightShoulder) {
      const torsoX = (leftShoulder.x + rightShoulder.x) / 2
      this.torsoXHistory.push(torsoX)
      if (this.torsoXHistory.length > 60) this.torsoXHistory.shift()
    }

    this.lastTimestamp = timestamp
  }

  getResults(): LiveResults {
    const minKnee = this.kneeAngles.length ? Math.min(...this.kneeAngles) : 180
    const flexibility = this.clampScore(((180 - minKnee) / 90) * 100)

    const peakHip = this.hipSpeeds.length ? Math.max(...this.hipSpeeds) : 0
    const power = this.clampScore(Math.min(100, peakHip))

    const meanX = this.torsoXHistory.length ? this.torsoXHistory.reduce((a, b) => a + b, 0) / this.torsoXHistory.length : 0
    const variance = this.torsoXHistory.length ? this.torsoXHistory.reduce((s, x) => s + Math.pow(x - meanX, 2), 0) / this.torsoXHistory.length : 0
    const stability = this.clampScore(100 - Math.min(100, variance * 0.1))

    return { flexibility, power, stability }
  }
}

// Tennis Serve: track shoulder external rotation (flexibility), racket hand speed (power), head stability
export class TennisServeAnalyzer extends BaseAnalyzer {
  private shoulderAngles: number[] = []
  private lastWrist: Keypoint | null = null
  private wristSpeeds: number[] = []
  private headXHistory: number[] = []

  processFrame(keypoints: Keypoint[], timestamp: number = performance.now()): void {
    this.frames++

    const rightElbow = keypoints[8]
    const rightShoulder = keypoints[6]
    const rightHip = keypoints[12]

    if (rightElbow && rightShoulder && rightHip) {
      const shoulder = calculateAngle(rightElbow, rightShoulder, rightHip)
      if (shoulder > 0) this.shoulderAngles.push(shoulder)
    }

    const rightWrist = keypoints[10]
    if (rightWrist) {
      if (this.lastTimestamp > 0) {
        const v = calculateVelocity(this.lastWrist, rightWrist, timestamp - this.lastTimestamp)
        if (v > 0) this.wristSpeeds.push(v)
      }
      this.lastWrist = rightWrist
    }

    const nose = keypoints[0]
    if (nose) {
      this.headXHistory.push(nose.x)
      if (this.headXHistory.length > 60) this.headXHistory.shift()
    }

    this.lastTimestamp = timestamp
  }

  getResults(): LiveResults {
    const range = this.shoulderAngles.length ? (Math.max(...this.shoulderAngles) - Math.min(...this.shoulderAngles)) : 0
    const flexibility = this.clampScore((range / 90) * 100)

    const peakWrist = this.wristSpeeds.length ? Math.max(...this.wristSpeeds) : 0
    const power = this.clampScore(Math.min(100, peakWrist))

    const meanX = this.headXHistory.length ? this.headXHistory.reduce((a, b) => a + b, 0) / this.headXHistory.length : 0
    const variance = this.headXHistory.length ? this.headXHistory.reduce((s, x) => s + Math.pow(x - meanX, 2), 0) / this.headXHistory.length : 0
    const stability = this.clampScore(100 - Math.min(100, variance * 0.1))

    return { flexibility, power, stability }
  }
}

export type LiveDrill = 'basketball_free_throw' | 'cricket_bowling' | 'soccer_penalty' | 'tennis_serve'

export function createLiveAnalyzer(drill: LiveDrill): BaseAnalyzer {
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


