import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/preact'
import { useWorkoutActions } from './use-workout-actions'
import { workoutService } from '@/application/services/workout.service'
import { CameraAccessEvent } from '@/application/events/camera-access-event'

const mockSubscribe = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock('../../hooks/use-event-bus', () => ({
  useEventBus: () => ({
    subscribe: mockSubscribe,
    publish: vi.fn()
  })
}))

vi.mock('@/application/services/workout.service', () => ({
  workoutService: {
    startWorkout: vi.fn(),
    stopWorkout: vi.fn()
  }
}))

describe('useWorkoutActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('start workout calls service', async () => {
    const mockVideoElement = document.createElement('video') as HTMLVideoElement
    const mockCanvasElement = document.createElement('canvas') as HTMLCanvasElement
    
    vi.mocked(workoutService.startWorkout).mockResolvedValue()
    mockSubscribe.mockReturnValue(mockUnsubscribe)

    const { result } = renderHook(() => useWorkoutActions())

    await act(async () => {
      await result.current.startWorkout(mockVideoElement, mockCanvasElement)
    })

    expect(workoutService.startWorkout).toHaveBeenCalledWith(mockVideoElement, mockCanvasElement)
  })

  it('stop workout calls service', () => {
    mockSubscribe.mockReturnValue(mockUnsubscribe)
    
    const { result } = renderHook(() => useWorkoutActions())

    act(() => {
      result.current.stopWorkout()
    })

    expect(workoutService.stopWorkout).toHaveBeenCalledOnce()
  })

  it('tracks camera errors', () => {
    let mockListener: (event: CameraAccessEvent) => void = vi.fn()
    
    mockSubscribe.mockImplementation((listener) => {
      mockListener = listener
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useWorkoutActions())

    expect(result.current.cameraError).toBeUndefined()

    // Simulate camera error event
    const errorEvent = new CameraAccessEvent({ 
      status: 'error', 
      message: 'Camera access denied' 
    })
    
    act(() => {
      mockListener(errorEvent)
    })

    expect(result.current.cameraError).toBe('Camera access denied')
  })

  it('tracks starting state', async () => {
    const mockVideoElement = document.createElement('video') as HTMLVideoElement
    const mockCanvasElement = document.createElement('canvas') as HTMLCanvasElement
    
    let resolveStartWorkout: () => void
    const startWorkoutPromise = new Promise<void>((resolve) => {
      resolveStartWorkout = resolve
    })
    
    vi.mocked(workoutService.startWorkout).mockReturnValue(startWorkoutPromise)
    mockSubscribe.mockReturnValue(mockUnsubscribe)

    const { result } = renderHook(() => useWorkoutActions())

    expect(result.current.isStarting).toBe(false)

    // Start workout (don't await yet)
    act(() => {
      result.current.startWorkout(mockVideoElement, mockCanvasElement)
    })

    expect(result.current.isStarting).toBe(true)

    // Complete startup
    await act(async () => {
      resolveStartWorkout!()
      await startWorkoutPromise
    })

    expect(result.current.isStarting).toBe(false)
  })
})