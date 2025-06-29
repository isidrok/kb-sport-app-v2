import { describe, it, expect } from 'vitest'
import { RepDetectionStateMachine, type RepKeyPoints } from './rep-detection-state-machine'

describe('RepDetectionStateMachine', () => {
  it('initial state is down', () => {
    const stateMachine = new RepDetectionStateMachine()
    
    expect(stateMachine.getCurrentState()).toBe('down')
  })

  it('stays in down when wrists below nose', () => {
    const stateMachine = new RepDetectionStateMachine()
    const keyPoints: RepKeyPoints = {
      noseY: 100,
      leftWristY: 200,
      rightWristY: 210,
      leftWristConfidence: 0.8,
      rightWristConfidence: 0.9,
      noseConfidence: 0.7
    }
    
    const result = stateMachine.processKeyPoints(keyPoints)
    
    expect(stateMachine.getCurrentState()).toBe('down')
    expect(result.repDetected).toBe(false)
  })

  it('transitions to up when wrists above nose', async () => {
    const stateMachine = new RepDetectionStateMachine()
    
    // Wait for 300ms to meet timing requirement for down state
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const keyPoints: RepKeyPoints = {
      noseY: 200,
      leftWristY: 50,
      rightWristY: 60,
      leftWristConfidence: 0.8,
      rightWristConfidence: 0.9,
      noseConfidence: 0.7
    }
    
    const result = stateMachine.processKeyPoints(keyPoints)
    
    expect(stateMachine.getCurrentState()).toBe('up')
    expect(result.repDetected).toBe(false) // No rep yet, just transitioned to up
  })

  it('detects rep after being up for 300ms', async () => {
    const stateMachine = new RepDetectionStateMachine()
    
    // Wait for 300ms to meet timing requirement for down state
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Transition to up state
    const upKeyPoints: RepKeyPoints = {
      noseY: 200,
      leftWristY: 50,
      rightWristY: 60,
      leftWristConfidence: 0.8,
      rightWristConfidence: 0.9,
      noseConfidence: 0.7
    }
    
    let result = stateMachine.processKeyPoints(upKeyPoints)
    expect(stateMachine.getCurrentState()).toBe('up')
    expect(result.repDetected).toBe(false) // No rep yet, just transitioned
    
    // Wait another 300ms while in up state
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Process same key points again - should detect rep after 300ms up
    result = stateMachine.processKeyPoints(upKeyPoints)
    expect(result.repDetected).toBe(true)
  })

  it('both hands priority over single', async () => {
    const stateMachine = new RepDetectionStateMachine()
    
    // Wait for 300ms to meet timing requirement for down state
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Both hands above nose - transition to up
    const upKeyPoints: RepKeyPoints = {
      noseY: 200,
      leftWristY: 50,
      rightWristY: 60,
      leftWristConfidence: 0.8,
      rightWristConfidence: 0.9,
      noseConfidence: 0.7
    }
    
    stateMachine.processKeyPoints(upKeyPoints) // Transition to up
    
    // Wait another 300ms in up state
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Should detect rep with 'both' hand after 300ms up
    const result = stateMachine.processKeyPoints(upKeyPoints)
    
    expect(result.repDetected).toBe(true)
    expect(result.hand).toBe('both')
  })

  it('ignores low confidence key points', () => {
    const stateMachine = new RepDetectionStateMachine(0.6) // Higher confidence threshold
    const lowConfidenceKeyPoints: RepKeyPoints = {
      noseY: 200,
      leftWristY: 50,
      rightWristY: 60,
      leftWristConfidence: 0.5, // Below 0.6 threshold
      rightWristConfidence: 0.5, // Below 0.6 threshold
      noseConfidence: 0.5 // Below 0.6 threshold
    }
    
    const result = stateMachine.processKeyPoints(lowConfidenceKeyPoints)
    
    expect(result.repDetected).toBe(false)
    expect(stateMachine.getCurrentState()).toBe('down') // Should stay in down
  })

  it('uses custom minimum duration', async () => {
    const stateMachine = new RepDetectionStateMachine(0.5, 100) // 100ms minimum duration
    
    // Wait 150ms to ensure we exceed the 100ms threshold
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const upKeyPoints: RepKeyPoints = {
      noseY: 200,
      leftWristY: 50,
      rightWristY: 60,
      leftWristConfidence: 0.8,
      rightWristConfidence: 0.9,
      noseConfidence: 0.7
    }
    
    let result = stateMachine.processKeyPoints(upKeyPoints)
    expect(stateMachine.getCurrentState()).toBe('up') // Should transition after 100ms
    
    // Wait another 150ms in up state
    await new Promise(resolve => setTimeout(resolve, 150))
    
    result = stateMachine.processKeyPoints(upKeyPoints)
    expect(result.repDetected).toBe(true) // Should detect rep after 100ms up
  })
})