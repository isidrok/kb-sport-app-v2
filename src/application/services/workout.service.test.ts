import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest'
import { WorkoutService } from './workout.service'
import { StartWorkoutUseCase } from '@/application/use-cases/start-workout-use-case'
import { StopWorkoutUseCase } from '@/application/use-cases/stop-workout-use-case'
import { DetectRepUseCase } from '@/application/use-cases/detect-rep-use-case'
import { WorkoutTimerUseCase } from '@/application/use-cases/workout-timer-use-case'
import type { PoseService } from './pose.service'
import type { PreviewService } from './preview.service'
import type { WorkoutStorageService } from './workout-storage.service'
import { type Prediction } from '@/domain/types/rep-detection.types'

vi.mock('@/application/use-cases/start-workout-use-case')
vi.mock('@/application/use-cases/stop-workout-use-case')
vi.mock('@/application/use-cases/detect-rep-use-case')
vi.mock('@/application/use-cases/workout-timer-use-case')

describe('WorkoutService', () => {
  let workoutService: WorkoutService
  let mockStartWorkoutUseCase: Mocked<StartWorkoutUseCase>
  let mockStopWorkoutUseCase: Mocked<StopWorkoutUseCase>
  let mockDetectRepUseCase: Mocked<DetectRepUseCase>
  let mockWorkoutTimerUseCase: Mocked<WorkoutTimerUseCase>
  let mockPoseService: Mocked<PoseService>
  let mockPreviewService: Mocked<PreviewService>
  let mockWorkoutStorageService: Mocked<WorkoutStorageService>

  beforeEach(() => {
    mockStartWorkoutUseCase = {
      execute: vi.fn()
    } as Partial<StartWorkoutUseCase> as Mocked<StartWorkoutUseCase>
    
    mockStopWorkoutUseCase = {
      execute: vi.fn()
    } as Partial<StopWorkoutUseCase> as Mocked<StopWorkoutUseCase>
    

    mockDetectRepUseCase = {
      execute: vi.fn()
    } as Partial<DetectRepUseCase> as Mocked<DetectRepUseCase>

    mockWorkoutTimerUseCase = {
      start: vi.fn(),
      stop: vi.fn()
    } as Partial<WorkoutTimerUseCase> as Mocked<WorkoutTimerUseCase>

    mockPoseService = {
      startPoseDetection: vi.fn(),
      stopPoseDetection: vi.fn(),
      processFrame: vi.fn().mockReturnValue(null),
      isActive: vi.fn().mockReturnValue(false),
      getMediaStream: vi.fn().mockReturnValue(null)
    } as Partial<PoseService> as Mocked<PoseService>

    mockPreviewService = {
      startPreview: vi.fn(),
      stopPreview: vi.fn(),
      stopPreviewOnly: vi.fn(),
      isPreviewActive: vi.fn().mockReturnValue(false)
    } as Partial<PreviewService> as Mocked<PreviewService>

    mockWorkoutStorageService = {
      startVideoRecording: vi.fn(),
      stopRecording: vi.fn(),
      getStoredWorkouts: vi.fn(),
      getWorkoutVideo: vi.fn(),
      deleteWorkout: vi.fn()
    } as Partial<WorkoutStorageService> as Mocked<WorkoutStorageService>

    workoutService = new WorkoutService({
      startWorkoutUseCase: mockStartWorkoutUseCase,
      stopWorkoutUseCase: mockStopWorkoutUseCase,
      detectRepUseCase: mockDetectRepUseCase,
      workoutTimerUseCase: mockWorkoutTimerUseCase,
      poseService: mockPoseService,
      previewService: mockPreviewService,
      workoutStorageService: mockWorkoutStorageService
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

  it('returns workout stats from domain entity', () => {
    workoutService.createWorkout()

    const result = workoutService.getWorkoutStatus()

    expect(result).toEqual({
      status: 'idle',
      startTime: null,
      endTime: null,
      isActive: false,
      repCount: 0,
      elapsedTime: 0,
      formattedTime: '00:00',
      averageRPM: 0,
      currentRPM: 0,
      reps: []
    })
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

  it('calls detect rep after frame processing when workout is active', () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement
    const mockPrediction: Prediction = {
      box: [0, 0, 100, 100],
      score: 0.8,
      keypoints: [[50, 50, 0.9], [30, 70, 0.8], [70, 70, 0.8]]
    }
    
    // Create and start workout
    const workout = workoutService.createWorkout()
    workout.start()
    
    // Mock pose service to return prediction
    mockPoseService.processFrame.mockReturnValue(mockPrediction)
    
    workoutService.processFrame(mockVideo, mockCanvas)
    
    expect(mockPoseService.processFrame).toHaveBeenCalledWith(mockVideo, mockCanvas)
    expect(mockDetectRepUseCase.execute).toHaveBeenCalledWith({
      prediction: mockPrediction,
      workout: workout
    })
  })

  it('skips detection when workout is not active', () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement
    const mockPrediction: Prediction = {
      box: [0, 0, 100, 100],
      score: 0.8,
      keypoints: [[50, 50, 0.9], [30, 70, 0.8], [70, 70, 0.8]]
    }
    
    // Create workout but don't start it (should be idle)
    workoutService.createWorkout()
    
    // Mock pose service to return prediction
    mockPoseService.processFrame.mockReturnValue(mockPrediction)
    
    workoutService.processFrame(mockVideo, mockCanvas)
    
    expect(mockPoseService.processFrame).toHaveBeenCalledWith(mockVideo, mockCanvas)
    expect(mockDetectRepUseCase.execute).not.toHaveBeenCalled()
  })

  it('continues frame processing when rep detection throws error', () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement
    const mockPrediction: Prediction = {
      box: [0, 0, 100, 100],
      score: 0.8,
      keypoints: [[50, 50, 0.9], [30, 70, 0.8], [70, 70, 0.8]]
    }
    
    // Create and start workout
    const workout = workoutService.createWorkout()
    workout.start()
    
    // Mock pose service to return prediction
    mockPoseService.processFrame.mockReturnValue(mockPrediction)
    
    // Mock detect rep use case to throw error
    mockDetectRepUseCase.execute.mockImplementation(() => {
      throw new Error('Rep detection failed')
    })
    
    // Should not throw error and continue processing
    expect(() => {
      workoutService.processFrame(mockVideo, mockCanvas)
    }).not.toThrow()
    
    expect(mockPoseService.processFrame).toHaveBeenCalledWith(mockVideo, mockCanvas)
    expect(mockDetectRepUseCase.execute).toHaveBeenCalledWith({
      prediction: mockPrediction,
      workout: workout
    })
  })

  it('starts timer on workout start', async () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement

    await workoutService.startWorkout(mockVideo, mockCanvas)

    const workout = workoutService.currentWorkout
    expect(workout).toBeDefined()
    expect(mockWorkoutTimerUseCase.start).toHaveBeenCalledWith(workout)
  })

  it('stops timer on workout stop', () => {
    workoutService.createWorkout()
    const mockCanvas = {} as HTMLCanvasElement

    workoutService.stopWorkout(mockCanvas)

    expect(mockWorkoutTimerUseCase.stop).toHaveBeenCalled()
  })

  it('workout stats include all metrics', () => {
    vi.useFakeTimers()
    
    try {
      const workout = workoutService.createWorkout()
      workout.start()
      
      // Advance time to see elapsed time
      vi.advanceTimersByTime(65000) // 1 minute 5 seconds
      
      const stats = workoutService.getWorkoutStatus()
      
      expect(stats).toBeDefined()
      expect(stats?.elapsedTime).toBeGreaterThan(0)
      expect(stats?.formattedTime).toBe('01:05')
      expect(stats?.averageRPM).toBe(0)
      expect(stats?.currentRPM).toBe(0)
      expect(stats?.reps).toEqual([])
      expect(stats?.repCount).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
})