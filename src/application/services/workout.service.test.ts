import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest'
import { WorkoutService } from './workout.service'
import { StartWorkoutUseCase } from '@/application/use-cases/start-workout-use-case'
import { StopWorkoutUseCase } from '@/application/use-cases/stop-workout-use-case'
import { GetWorkoutStatusUseCase } from '@/application/use-cases/get-workout-status-use-case'
import type { PoseService } from './pose.service'
import type { PreviewService } from './preview.service'

vi.mock('@/application/use-cases/start-workout-use-case')
vi.mock('@/application/use-cases/stop-workout-use-case')
vi.mock('@/application/use-cases/get-workout-status-use-case')

describe('WorkoutService', () => {
  let workoutService: WorkoutService
  let mockStartWorkoutUseCase: Mocked<StartWorkoutUseCase>
  let mockStopWorkoutUseCase: Mocked<StopWorkoutUseCase>
  let mockGetWorkoutStatusUseCase: Mocked<GetWorkoutStatusUseCase>
  let mockPoseService: Mocked<PoseService>
  let mockPreviewService: Mocked<PreviewService>

  beforeEach(() => {
    mockStartWorkoutUseCase = {
      execute: vi.fn()
    } as Partial<StartWorkoutUseCase> as Mocked<StartWorkoutUseCase>
    
    mockStopWorkoutUseCase = {
      execute: vi.fn()
    } as Partial<StopWorkoutUseCase> as Mocked<StopWorkoutUseCase>
    
    mockGetWorkoutStatusUseCase = {
      execute: vi.fn()
    } as Partial<GetWorkoutStatusUseCase> as Mocked<GetWorkoutStatusUseCase>

    mockPoseService = {
      startPoseDetection: vi.fn(),
      stopPoseDetection: vi.fn(),
      processFrame: vi.fn(),
      isActive: vi.fn().mockReturnValue(false)
    } as Partial<PoseService> as Mocked<PoseService>

    mockPreviewService = {
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      stopPreviewOnly: vi.fn(),
      isPreviewActive: vi.fn().mockReturnValue(false)
    } as Partial<PreviewService> as Mocked<PreviewService>

    workoutService = new WorkoutService({
      startWorkoutUseCase: mockStartWorkoutUseCase,
      stopWorkoutUseCase: mockStopWorkoutUseCase,
      getWorkoutStatusUseCase: mockGetWorkoutStatusUseCase,
      poseService: mockPoseService,
      previewService: mockPreviewService
    })
  })

  it('creates workout on initialization', () => {
    const workout = workoutService.createWorkout()
    
    expect(workout).toBeDefined()
    expect(workoutService.currentWorkout).toBe(workout)
  })

  it('delegates pose detection setup to pose service', async () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement

    await workoutService.startWorkout(mockVideo, mockCanvas)

    expect(mockPoseService.startPoseDetection).toHaveBeenCalledWith(mockVideo, mockCanvas)
  })

  it('starts workout and calls workout use case', async () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement

    await workoutService.startWorkout(mockVideo, mockCanvas)

    const workout = workoutService.currentWorkout
    expect(workout).toBeDefined()
    expect(mockStartWorkoutUseCase.execute).toHaveBeenCalledWith(workout)
  })

  it('stop workout calls pose service and workout use case', () => {
    const workout = workoutService.createWorkout()
    const mockCanvas = {} as HTMLCanvasElement

    workoutService.stopWorkout(mockCanvas)

    expect(mockPoseService.stopPoseDetection).toHaveBeenCalledWith(mockCanvas)
    expect(mockStopWorkoutUseCase.execute).toHaveBeenCalledWith(workout, mockCanvas)
  })

  it('delegates process frame to pose service', () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement

    workoutService.processFrame(mockVideo, mockCanvas)

    expect(mockPoseService.processFrame).toHaveBeenCalledWith(mockVideo, mockCanvas)
  })

  it('returns workout stats', () => {
    const workout = workoutService.createWorkout()
    const mockStats = { status: 'idle', canStart: true, canStop: false } as any
    mockGetWorkoutStatusUseCase.execute.mockReturnValue(mockStats)

    const result = workoutService.getWorkoutStatus()

    expect(mockGetWorkoutStatusUseCase.execute).toHaveBeenCalledWith(workout)
    expect(result).toBe(mockStats)
  })

  it('creates new workout when starting after previous workout stopped', async () => {
    vi.useFakeTimers()
    
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement
    
    try {
      // Start first workout
      await workoutService.startWorkout(mockVideo, mockCanvas)
      const firstWorkout = workoutService.currentWorkout
      
      // Stop the workout
      workoutService.stopWorkout()
      
      // Advance time to ensure different timestamp
      vi.advanceTimersByTime(1000)
      
      // Start again - should create new workout instance
      await workoutService.startWorkout(mockVideo, mockCanvas)
      const secondWorkout = workoutService.currentWorkout
      
      // Verify we have different workout instances
      expect(firstWorkout).not.toBe(secondWorkout)
      expect(firstWorkout?.id).not.toBe(secondWorkout?.id)
      expect(secondWorkout).toBeDefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('stops preview when starting workout for seamless transition', async () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement
    
    // Mock preview as active
    mockPreviewService.isPreviewActive.mockReturnValue(true)
    
    await workoutService.startWorkout(mockVideo, mockCanvas)
    
    expect(mockPreviewService.stopPreviewOnly).toHaveBeenCalled()
    expect(mockPoseService.startPoseDetection).toHaveBeenCalledWith(mockVideo, mockCanvas)
  })

  it('does not stop preview when not active during workout start', async () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement
    
    // Mock preview as inactive
    mockPreviewService.isPreviewActive.mockReturnValue(false)
    
    await workoutService.startWorkout(mockVideo, mockCanvas)
    
    expect(mockPreviewService.stopPreviewOnly).not.toHaveBeenCalled()
    expect(mockPoseService.startPoseDetection).toHaveBeenCalledWith(mockVideo, mockCanvas)
  })
})