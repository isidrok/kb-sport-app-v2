export interface RepKeyPoints {
  noseY: number
  leftWristY: number
  rightWristY: number
  leftWristConfidence: number
  rightWristConfidence: number
  noseConfidence: number
}

export interface StateTransitionResult {
  repDetected: boolean
  hand?: 'left' | 'right' | 'both'
}

export type RepState = 'down' | 'up'

export class RepDetectionStateMachine {
  private _currentState: RepState = 'down'
  private _stateStartTime: number = performance.now()
  private _repDetectedInCurrentUpCycle: boolean = false

  constructor(
    private confidenceThreshold: number = 0.5,
    private minStateDuration: number = 300
  ) {}

  processKeyPoints(keyPoints: RepKeyPoints): StateTransitionResult {
    const currentTime = performance.now()
    const timeInCurrentState = currentTime - this._stateStartTime
    
    // Check if we have sufficient confidence for all required points
    if (keyPoints.noseConfidence < this.confidenceThreshold ||
        keyPoints.leftWristConfidence < this.confidenceThreshold ||
        keyPoints.rightWristConfidence < this.confidenceThreshold) {
      return { repDetected: false }
    }
    
    // Check if any wrist is above nose (lower Y value = higher position)
    const leftWristAboveNose = keyPoints.leftWristY < keyPoints.noseY
    const rightWristAboveNose = keyPoints.rightWristY < keyPoints.noseY
    const anyWristAboveNose = leftWristAboveNose || rightWristAboveNose
    
    // State transition logic with timing and rep detection
    let repDetected = false
    let hand: 'left' | 'right' | 'both' | undefined
    
    if (this._currentState === 'down' && anyWristAboveNose && timeInCurrentState >= this.minStateDuration) {
      // Transition to up state after minimum duration down
      this._currentState = 'up'
      this._stateStartTime = currentTime
      this._repDetectedInCurrentUpCycle = false // Reset rep detection flag for new up cycle
    } else if (this._currentState === 'up' && anyWristAboveNose && timeInCurrentState >= this.minStateDuration && !this._repDetectedInCurrentUpCycle) {
      // Detect rep after being up for minimum duration (only once per up cycle)
      repDetected = true
      this._repDetectedInCurrentUpCycle = true
      
      // Determine which hand(s) were used - priority: both > left > right
      if (leftWristAboveNose && rightWristAboveNose) {
        hand = 'both'
      } else if (leftWristAboveNose) {
        hand = 'left'
      } else if (rightWristAboveNose) {
        hand = 'right'
      }
    } else if (this._currentState === 'up' && !anyWristAboveNose && timeInCurrentState >= this.minStateDuration) {
      // Transition back to down state after minimum duration up
      this._currentState = 'down'
      this._stateStartTime = currentTime
    }
    
    return { repDetected, hand }
  }

  getCurrentState(): RepState {
    return this._currentState
  }

  reset(): void {
    this._currentState = 'down'
    this._stateStartTime = performance.now()
    this._repDetectedInCurrentUpCycle = false
  }
}