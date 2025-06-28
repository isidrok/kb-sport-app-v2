import { renderHook } from '@testing-library/preact'
import { useFrameProcessing } from './use-frame-processing'
import { useWorkoutState } from './use-workout-state'
import { workoutService } from '@/application/services/workout.service'
import { WorkoutStatus } from '@/domain/entities/workout-entity'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import { createRef } from 'preact'

vi.mock('./use-workout-state')
vi.mock('@/application/services/workout.service')

const mockUseWorkoutState = vi.mocked(useWorkoutState)
const mockWorkoutService = vi.mocked(workoutService)

describe('useFrameProcessing', () => {
  let mockVideoRef: ReturnType<typeof createRef<HTMLVideoElement>>
  let mockCanvasRef: ReturnType<typeof createRef<HTMLCanvasElement>>
  let mockRequestAnimationFrame: ReturnType<typeof vi.fn>
  let mockCancelAnimationFrame: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockVideoRef = createRef<HTMLVideoElement>()
    mockCanvasRef = createRef<HTMLCanvasElement>()
    
    // Mock video and canvas elements
    mockVideoRef.current = document.createElement('video') as HTMLVideoElement
    mockCanvasRef.current = document.createElement('canvas') as HTMLCanvasElement
    
    // Mock animation frame functions
    mockRequestAnimationFrame = vi.fn().mockReturnValue(123)
    mockCancelAnimationFrame = vi.fn()
    
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: mockRequestAnimationFrame
    })
    Object.defineProperty(window, 'cancelAnimationFrame', {
      writable: true,
      value: mockCancelAnimationFrame
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts frame processing when workout is active', () => {
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.ACTIVE,
      canStart: false,
      canStop: true,
      startTime: new Date(),
      endTime: null
    })

    renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function))
  })

  it('does not start frame processing when workout is idle', () => {
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.IDLE,
      canStart: true,
      canStop: false,
      startTime: null,
      endTime: null
    })

    renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    expect(mockRequestAnimationFrame).not.toHaveBeenCalled()
  })

  it('calls workoutService.processFrame when elements exist and workout is active', () => {
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.ACTIVE,
      canStart: false,
      canStop: true,
      startTime: new Date(),
      endTime: null
    })

    // Capture the frame processing function
    let frameProcessor: Function | undefined
    mockRequestAnimationFrame.mockImplementation((fn) => {
      frameProcessor = fn
      return 123
    })

    renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    // Call the frame processor
    if (frameProcessor) {
      frameProcessor()
    }

    expect(mockWorkoutService.processFrame).toHaveBeenCalledWith(
      mockVideoRef.current,
      mockCanvasRef.current
    )
  })

  it('stops frame processing when workout status changes from active to stopped', () => {
    // Start with active workout
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.ACTIVE,
      canStart: false,
      canStop: true,
      startTime: new Date(),
      endTime: null
    })

    const { rerender } = renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    // Verify frame processing started
    expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function))
    
    // Change workout status to stopped
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.STOPPED,
      canStart: true,
      canStop: false,
      startTime: new Date(),
      endTime: new Date()
    })
    
    rerender()

    // Verify animation frame was canceled
    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123)
  })

  it('cancels animation frame on cleanup', () => {
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.ACTIVE,
      canStart: false,
      canStop: true,
      startTime: new Date(),
      endTime: null
    })

    const { unmount } = renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    unmount()

    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123)
  })
})