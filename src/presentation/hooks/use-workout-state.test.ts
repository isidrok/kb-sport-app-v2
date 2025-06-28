import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/preact'
import { useWorkoutState } from './use-workout-state'
import { workoutService } from '@/application/services/workout.service'
import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'
import { WorkoutStatus } from '@/domain/entities/workout-entity'

const mockSubscribe = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock('./use-event-bus', () => ({
  useEventBus: () => ({
    subscribe: mockSubscribe,
    publish: vi.fn()
  })
}))

vi.mock('@/application/services/workout.service', () => ({
  workoutService: {
    getWorkoutStatus: vi.fn()
  }
}))

describe('useWorkoutState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns current workout stats', () => {
    const mockStats = {
      status: WorkoutStatus.IDLE,
      canStart: true,
      canStop: false,
      startTime: null,
      endTime: null
    }
    
    vi.mocked(workoutService.getWorkoutStatus).mockReturnValue(mockStats)
    mockSubscribe.mockReturnValue(mockUnsubscribe)

    const { result } = renderHook(() => useWorkoutState())

    expect(result.current).toEqual(mockStats)
    expect(workoutService.getWorkoutStatus).toHaveBeenCalledOnce()
  })

  it('updates on workout events', () => {
    let mockListener: (event: WorkoutStatusEvent) => void = vi.fn()
    
    const initialStats = {
      status: WorkoutStatus.IDLE,
      canStart: true,
      canStop: false,
      startTime: null,
      endTime: null
    }
    
    const updatedStats = {
      status: WorkoutStatus.ACTIVE,
      canStart: false,
      canStop: true,
      startTime: new Date(),
      endTime: null
    }
    
    vi.mocked(workoutService.getWorkoutStatus)
      .mockReturnValueOnce(initialStats)
      .mockReturnValueOnce(updatedStats)
    
    mockSubscribe.mockImplementation((listener) => {
      mockListener = listener
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useWorkoutState())

    expect(result.current.status).toBe(WorkoutStatus.IDLE)

    // Simulate workout status event
    const statusEvent = new WorkoutStatusEvent({ 
      workoutId: 'workout_123', 
      status: WorkoutStatus.ACTIVE 
    })
    
    act(() => {
      mockListener(statusEvent)
    })

    expect(result.current.status).toBe(WorkoutStatus.ACTIVE)
    expect(workoutService.getWorkoutStatus).toHaveBeenCalledTimes(2)
  })

  it('cleans up listeners', () => {
    mockSubscribe.mockReturnValue(mockUnsubscribe)
    
    const { unmount } = renderHook(() => useWorkoutState())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledOnce()
  })
})