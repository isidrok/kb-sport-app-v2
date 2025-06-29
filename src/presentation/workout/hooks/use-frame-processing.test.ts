import { renderHook } from '@testing-library/preact'
import { useFrameProcessing } from './use-frame-processing'
import { useWorkoutState } from './use-workout-state'
import { usePreview } from '../../hooks/use-preview'
import { poseService } from '@/application/services/pose.service'
import { WorkoutStatus } from '@/domain/entities/workout-entity'
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest'
import { createRef } from 'preact'

vi.mock('./use-workout-state')
vi.mock('@/application/services/pose.service')
vi.mock('../../hooks/use-preview')

const mockUseWorkoutState = vi.mocked(useWorkoutState)
const mockPoseService = vi.mocked(poseService)
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

    // Set up poseService mock
    mockPoseService.processFrame = vi.fn()
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
      endTime: null,
      repCount: 0
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
      endTime: null,
      repCount: 0
    })

    renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    expect(mockRequestAnimationFrame).not.toHaveBeenCalled()
  })

  it('calls poseService.processFrame when elements exist and workout is active', () => {
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.ACTIVE,
      canStart: false,
      canStop: true,
      startTime: new Date(),
      endTime: null,
      repCount: 0
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

    expect(mockPoseService.processFrame).toHaveBeenCalledWith(
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
      endTime: null,
      repCount: 0
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
      endTime: new Date(),
      repCount: 0
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
      endTime: null,
      repCount: 0
    })

    const { unmount } = renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    unmount()

    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123)
  })

  it('processes frames during preview mode', () => {
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.IDLE,
      canStart: true,
      canStop: false,
      startTime: null,
      endTime: null,
      repCount: 0
    })

    mockUsePreview.mockReturnValue({
      isPreviewActive: true,
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      error: null
    })

    renderHook(() => useFrameProcessing(mockVideoRef, mockCanvasRef))

    expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function))
  })

  it('calls poseService.processFrame during preview', () => {
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.IDLE,
      canStart: true,
      canStop: false,
      startTime: null,
      endTime: null,
      repCount: 0
    })

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

    expect(mockPoseService.processFrame).toHaveBeenCalledWith(
      mockVideoRef.current,
      mockCanvasRef.current
    )
  })

  it('stops processing when both workout and preview are inactive', () => {
    // Start with preview active
    mockUseWorkoutState.mockReturnValue({
      status: WorkoutStatus.IDLE,
      canStart: true,
      canStop: false,
      startTime: null,
      endTime: null,
      repCount: 0
    })

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