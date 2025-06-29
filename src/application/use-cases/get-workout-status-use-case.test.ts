import { describe, it, expect, beforeEach } from 'vitest'
import { GetWorkoutStatusUseCase } from './get-workout-status-use-case'
import { WorkoutEntity } from '@/domain/entities/workout-entity'
import { type Rep } from '@/domain/types/rep-detection.types'

describe('GetWorkoutStatusUseCase', () => {
  let useCase: GetWorkoutStatusUseCase
  let idleWorkout: WorkoutEntity
  let activeWorkout: WorkoutEntity
  let stoppedWorkout: WorkoutEntity

  beforeEach(() => {
    useCase = new GetWorkoutStatusUseCase()
    
    idleWorkout = new WorkoutEntity('workout-1')
    
    activeWorkout = new WorkoutEntity('workout-2')
    activeWorkout.start()
    
    stoppedWorkout = new WorkoutEntity('workout-3')
    stoppedWorkout.start()
    stoppedWorkout.stop()
  })

  it('returns workout stats', () => {
    const stats = useCase.execute(activeWorkout)

    expect(stats.status).toBe('active')
    expect(stats.startTime).toBeInstanceOf(Date)
    expect(stats.endTime).toBeNull()
    expect(stats.canStart).toBe(false)
    expect(stats.canStop).toBe(true)
  })

  it('can start when idle', () => {
    const stats = useCase.execute(idleWorkout)

    expect(stats.canStart).toBe(true)
    expect(stats.canStop).toBe(false)
  })

  it('can stop when active', () => {
    const stats = useCase.execute(activeWorkout)

    expect(stats.canStart).toBe(false)
    expect(stats.canStop).toBe(true)
  })

  it('can start again when stopped', () => {
    const stats = useCase.execute(stoppedWorkout)

    expect(stats.canStart).toBe(true)
    expect(stats.canStop).toBe(false)
  })

  it('includes rep count in stats', () => {
    const rep: Rep = {
      hand: 'both',
      timestamp: new Date()
    }
    activeWorkout.addRep(rep)
    
    const stats = useCase.execute(activeWorkout)
    
    expect(stats.repCount).toBe(1)
  })

  it('rep count updates with workout changes', () => {
    const rep1: Rep = {
      hand: 'left',
      timestamp: new Date()
    }
    const rep2: Rep = {
      hand: 'right',
      timestamp: new Date()
    }
    
    // Initially no reps
    let stats = useCase.execute(activeWorkout)
    expect(stats.repCount).toBe(0)
    
    // Add first rep
    activeWorkout.addRep(rep1)
    stats = useCase.execute(activeWorkout)
    expect(stats.repCount).toBe(1)
    
    // Add second rep
    activeWorkout.addRep(rep2)
    stats = useCase.execute(activeWorkout)
    expect(stats.repCount).toBe(2)
  })
})