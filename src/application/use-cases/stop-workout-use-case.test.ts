import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StopWorkoutUseCase } from './stop-workout-use-case'
import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'
import { eventBus } from '@/infrastructure/event-bus/event-bus'
import { predictionRendererAdapter } from '@/infrastructure/adapters/prediction-renderer.adapter'
import { WorkoutEntity } from '@/domain/entities/workout-entity'

vi.mock('@/infrastructure/event-bus/event-bus')
vi.mock('@/infrastructure/adapters/prediction-renderer.adapter')

describe('StopWorkoutUseCase', () => {
  let useCase: StopWorkoutUseCase
  const mockEventBus = vi.mocked(eventBus)
  const mockRendererAdapter = vi.mocked(predictionRendererAdapter)
  let idleWorkout: WorkoutEntity
  let activeWorkout: WorkoutEntity

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new StopWorkoutUseCase(eventBus, predictionRendererAdapter)
    
    idleWorkout = new WorkoutEntity('workout-1')
    activeWorkout = new WorkoutEntity('workout-2')
    activeWorkout.start()
  })

  it('throws if workout not active', () => {
    expect(() => useCase.execute(idleWorkout)).toThrow('Cannot stop workout that is not active')
  })

  it('stops workout and publishes event', () => {
    useCase.execute(activeWorkout)

    expect(activeWorkout.status).toBe('stopped')
    expect(mockEventBus.publish).toHaveBeenCalledTimes(1)
    
    const call = mockEventBus.publish.mock.calls[0]
    const event = call[0]
    
    expect(event).toBeInstanceOf(WorkoutStatusEvent)
    expect(event.data.workoutId).toBe('workout-2')
    expect(event.data.status).toBe('stopped')
  })

  it('sets workout end time', () => {
    const before = new Date()
    useCase.execute(activeWorkout)
    const after = new Date()

    expect(activeWorkout.endTime).toBeInstanceOf(Date)
    expect(activeWorkout.endTime!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(activeWorkout.endTime!.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('clears canvas when canvas element provided', () => {
    const mockCanvas = document.createElement('canvas')
    
    useCase.execute(activeWorkout, mockCanvas)

    expect(mockRendererAdapter.clear).toHaveBeenCalledWith(mockCanvas)
  })

  it('does not clear canvas when no canvas element provided', () => {
    useCase.execute(activeWorkout)

    expect(mockRendererAdapter.clear).not.toHaveBeenCalled()
  })
})