import { renderHook } from '@testing-library/preact'
import { useFrameProcessing } from './use-frame-processing'
import { useWorkoutState } from './use-workout-state'
import { usePreview } from '../../hooks/use-preview'
import { workoutService } from '@/application/services/workout.service'
import { previewService } from '@/application/services/preview.service'
import { WorkoutStatus } from '@/domain/entities/workout-entity'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import { createRef } from 'preact'
import { createMockWorkoutStats } from '@/test-helpers/workout-stats-factory'

vi.mock('./use-workout-state')
vi.mock('@/application/services/workout.service')
vi.mock('@/application/services/preview.service')
vi.mock('../../hooks/use-preview')

const mockUseWorkoutState = vi.mocked(useWorkoutState)
const mockWorkoutService = vi.mocked(workoutService)
const mockPreviewService = vi.mocked(previewService)
const mockUsePreview = vi.mocked(usePreview)

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

    // Set up default mock for usePreview
    mockUsePreview.mockReturnValue({
      isPreviewActive: false,
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      error: null
    })

    // Set up service mocks
    mockWorkoutService.processFrame = vi.fn()
    mockPreviewService.processFrame = vi.fn()
    
    // Mock video element properties for readiness check
    Object.defineProperty(mockVideoRef.current, 'srcObject', {
      writable: true,
      value: new MediaStream()
    })
    Object.defineProperty(mockVideoRef.current, 'readyState', {
      writable: true,
      value: 4 // HAVE_ENOUGH_DATA
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts frame processing when workout is active', () => {
    mockUseWorkoutState.mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        isActive: true,
        startTime: new Date(),
        endTime: null,
        repCount: 0
      })
    )

    renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function))
  })

  it('does not start frame processing when workout is idle', () => {
    mockUseWorkoutState.mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        isActive: false,
        startTime: null,
        endTime: null,
        repCount: 0
      })
    )

    renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    expect(mockRequestAnimationFrame).not.toHaveBeenCalled()
  })

  it('calls workoutService.processFrame when elements exist and workout is active', () => {
    mockUseWorkoutState.mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        isActive: true,
        startTime: new Date(),
        endTime: null,
        repCount: 0
      })
    )

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
    mockUseWorkoutState.mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        isActive: true,
        startTime: new Date(),
        endTime: null,
        repCount: 0
      })
    )

    const { rerender } = renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    // Verify frame processing started
    expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function))
    
    // Change workout status to stopped
    mockUseWorkoutState.mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.STOPPED,
        isActive: false,
        startTime: new Date(),
        endTime: new Date(),
        repCount: 0
      })
    )
    
    rerender()

    // Verify animation frame was canceled
    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123)
  })

  it('cancels animation frame on cleanup', () => {
    mockUseWorkoutState.mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.ACTIVE,
        isActive: true,
        startTime: new Date(),
        endTime: null,
        repCount: 0
      })
    )

    const { unmount } = renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    unmount()

    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123)
  })

  it('processes frames during preview mode', () => {
    mockUseWorkoutState.mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        isActive: false,
        startTime: null,
        endTime: null,
        repCount: 0
      })
    )

    mockUsePreview.mockReturnValue({
      isPreviewActive: true,
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      error: null
    })

    renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function))
  })

  it('calls previewService.processFrame during preview', () => {
    mockUseWorkoutState.mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        isActive: false,
        startTime: null,
        endTime: null,
        repCount: 0
      })
    )

    mockUsePreview.mockReturnValue({
      isPreviewActive: true,
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      error: null
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

    expect(mockPreviewService.processFrame).toHaveBeenCalledWith(
      mockVideoRef.current,
      mockCanvasRef.current
    )
  })

  it('stops processing when both workout and preview are inactive', () => {
    // Start with preview active
    mockUseWorkoutState.mockReturnValue(
      createMockWorkoutStats({
        status: WorkoutStatus.IDLE,
        isActive: false,
        startTime: null,
        endTime: null,
        repCount: 0
      })
    )

    mockUsePreview.mockReturnValue({
      isPreviewActive: true,
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      error: null
    })

    const { rerender } = renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    // Verify frame processing started
    expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function))
    
    // Change to both inactive
    mockUsePreview.mockReturnValue({
      isPreviewActive: false,
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      error: null
    })
    
    rerender()

    // Verify animation frame was canceled
    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123)
  })
})