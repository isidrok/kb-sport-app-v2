import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StartWorkoutUseCase } from './start-workout-use-case'
import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'
import { eventBus } from '@/infrastructure/event-bus/event-bus'
import { WorkoutEntity } from '@/domain/entities/workout-entity'

vi.mock('@/infrastructure/event-bus/event-bus')

describe('StartWorkoutUseCase', () => {
  let useCase: StartWorkoutUseCase
  const mockEventBus = vi.mocked(eventBus)
  let idleWorkout: WorkoutEntity
  let activeWorkout: WorkoutEntity

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new StartWorkoutUseCase(eventBus)
    
    idleWorkout = new WorkoutEntity('workout-1')
    activeWorkout = new WorkoutEntity('workout-2')
    activeWorkout.start()
  })

  it('throws if workout not idle', () => {
    expect(() => useCase.execute(activeWorkout)).toThrow('Cannot start workout that is not idle')
  })

  it('starts workout and publishes event', () => {
    useCase.execute(idleWorkout)

    expect(idleWorkout.status).toBe('active')
    expect(mockEventBus.publish).toHaveBeenCalledTimes(1)
    
    const call = mockEventBus.publish.mock.calls[0]
    const event = call[0]
    
    expect(event).toBeInstanceOf(WorkoutStatusEvent)
    expect(event.data.workoutId).toBe('workout-1')
    expect(event.data.status).toBe('active')
  })

  it('sets workout start time', () => {
    const before = new Date()
    useCase.execute(idleWorkout)
    const after = new Date()

    expect(idleWorkout.startTime).toBeInstanceOf(Date)
    expect(idleWorkout.startTime!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(idleWorkout.startTime!.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})