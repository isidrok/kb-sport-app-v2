import { describe, it, expect } from 'vitest'
import { WorkoutEntity, WorkoutStatus } from './workout-entity'
import { type Rep } from '../types/rep-detection.types'

describe('WorkoutEntity', () => {
  it('creates workout with idle status', () => {
    const workout = new WorkoutEntity('workout-1')
    
    expect(workout.id).toBe('workout-1')
    expect(workout.status).toBe(WorkoutStatus.IDLE)
    expect(workout.startTime).toBeNull()
    expect(workout.endTime).toBeNull()
  })

  it('start workout sets active status and start time', () => {
    const workout = new WorkoutEntity('workout-1')
    const beforeStart = new Date()
    
    workout.start()
    
    const afterStart = new Date()
    expect(workout.status).toBe(WorkoutStatus.ACTIVE)
    expect(workout.startTime).not.toBeNull()
    expect(workout.startTime!.getTime()).toBeGreaterThanOrEqual(beforeStart.getTime())
    expect(workout.startTime!.getTime()).toBeLessThanOrEqual(afterStart.getTime())
  })

  it('stop workout sets stopped status and end time', () => {
    const workout = new WorkoutEntity('workout-1')
    workout.start()
    const beforeStop = new Date()
    
    workout.stop()
    
    const afterStop = new Date()
    expect(workout.status).toBe(WorkoutStatus.STOPPED)
    expect(workout.endTime).not.toBeNull()
    expect(workout.endTime!.getTime()).toBeGreaterThanOrEqual(beforeStop.getTime())
    expect(workout.endTime!.getTime()).toBeLessThanOrEqual(afterStop.getTime())
  })

  it('cannot start active workout', () => {
    const workout = new WorkoutEntity('workout-1')
    workout.start()
    
    expect(() => workout.start()).toThrow('Cannot start workout that is already active')
  })

  it('cannot stop idle workout', () => {
    const workout = new WorkoutEntity('workout-1')
    
    expect(() => workout.stop()).toThrow('Cannot stop workout that is not active')
  })

  it('workout starts with empty reps', () => {
    const workout = new WorkoutEntity('workout-1')
    
    expect(workout.reps).toEqual([])
    expect(workout.getRepCount()).toBe(0)
  })

  it('add rep increases count', () => {
    const workout = new WorkoutEntity('workout-1')
    const rep: Rep = { hand: 'left', timestamp: new Date() }
    
    workout.addRep(rep)
    
    expect(workout.reps).toHaveLength(1)
    expect(workout.reps[0]).toEqual(rep)
    expect(workout.getRepCount()).toBe(1)
  })

  it('get rep count returns total', () => {
    const workout = new WorkoutEntity('workout-1')
    const rep1: Rep = { hand: 'left', timestamp: new Date() }
    const rep2: Rep = { hand: 'right', timestamp: new Date() }
    const rep3: Rep = { hand: 'both', timestamp: new Date() }
    
    workout.addRep(rep1)
    workout.addRep(rep2)
    workout.addRep(rep3)
    
    expect(workout.getRepCount()).toBe(3)
    expect(workout.reps).toHaveLength(3)
  })
})