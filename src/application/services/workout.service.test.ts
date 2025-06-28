import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest'
import { WorkoutService } from './workout.service'
import { StartCameraUseCase } from '@/application/use-cases/start-camera-use-case'
import { StopCameraUseCase } from '@/application/use-cases/stop-camera-use-case'
import { StartWorkoutUseCase } from '@/application/use-cases/start-workout-use-case'
import { StopWorkoutUseCase } from '@/application/use-cases/stop-workout-use-case'
import { ProcessFrameUseCase } from '@/application/use-cases/process-frame-use-case'
import { GetWorkoutStatusUseCase } from '@/application/use-cases/get-workout-status-use-case'

vi.mock('@/application/use-cases/start-camera-use-case')
vi.mock('@/application/use-cases/stop-camera-use-case')
vi.mock('@/application/use-cases/start-workout-use-case')
vi.mock('@/application/use-cases/stop-workout-use-case')
vi.mock('@/application/use-cases/process-frame-use-case')
vi.mock('@/application/use-cases/get-workout-status-use-case')

describe('WorkoutService', () => {
  let workoutService: WorkoutService
  let mockStartCameraUseCase: Mocked<StartCameraUseCase>
  let mockStopCameraUseCase: Mocked<StopCameraUseCase>
  let mockStartWorkoutUseCase: Mocked<StartWorkoutUseCase>
  let mockStopWorkoutUseCase: Mocked<StopWorkoutUseCase>
  let mockProcessFrameUseCase: Mocked<ProcessFrameUseCase>
  let mockGetWorkoutStatusUseCase: Mocked<GetWorkoutStatusUseCase>

  beforeEach(() => {
    mockStartCameraUseCase = {
      execute: vi.fn()
    } as Partial<StartCameraUseCase> as Mocked<StartCameraUseCase>
    
    mockStopCameraUseCase = {
      execute: vi.fn()
    } as Partial<StopCameraUseCase> as Mocked<StopCameraUseCase>
    
    mockStartWorkoutUseCase = {
      execute: vi.fn()
    } as Partial<StartWorkoutUseCase> as Mocked<StartWorkoutUseCase>
    
    mockStopWorkoutUseCase = {
      execute: vi.fn()
    } as Partial<StopWorkoutUseCase> as Mocked<StopWorkoutUseCase>
    
    mockProcessFrameUseCase = {
      execute: vi.fn()
    } as Partial<ProcessFrameUseCase> as Mocked<ProcessFrameUseCase>
    
    mockGetWorkoutStatusUseCase = {
      execute: vi.fn()
    } as Partial<GetWorkoutStatusUseCase> as Mocked<GetWorkoutStatusUseCase>

    workoutService = new WorkoutService({
      startCameraUseCase: mockStartCameraUseCase,
      stopCameraUseCase: mockStopCameraUseCase,
      startWorkoutUseCase: mockStartWorkoutUseCase,
      stopWorkoutUseCase: mockStopWorkoutUseCase,
      processFrameUseCase: mockProcessFrameUseCase,
      getWorkoutStatusUseCase: mockGetWorkoutStatusUseCase
    })
  })

  it('creates workout on initialization', () => {
    const workout = workoutService.createWorkout()
    
    expect(workout).toBeDefined()
    expect(workoutService.currentWorkout).toBe(workout)
  })

  it('sets video canvas dimensions from client rect', async () => {
    workoutService.createWorkout()
    
    const mockVideo = {
      getBoundingClientRect: vi.fn().mockReturnValue({ width: 640, height: 480 }),
      width: 0,
      height: 0
    } as any
    const mockCanvas = {
      getBoundingClientRect: vi.fn().mockReturnValue({ width: 640, height: 480 }),
      width: 0,
      height: 0
    } as any

    await workoutService.startWorkout(mockVideo, mockCanvas)

    expect(mockVideo.width).toBe(640)
    expect(mockVideo.height).toBe(480)
    expect(mockCanvas.width).toBe(640)
    expect(mockCanvas.height).toBe(480)
  })

  it('start workout calls camera and workout use cases', async () => {
    const workout = workoutService.createWorkout()
    
    const mockVideo = {
      getBoundingClientRect: vi.fn().mockReturnValue({ width: 640, height: 480 }),
      width: 0,
      height: 0
    } as any
    const mockCanvas = {
      getBoundingClientRect: vi.fn().mockReturnValue({ width: 640, height: 480 }),
      width: 0,
      height: 0
    } as any

    await workoutService.startWorkout(mockVideo, mockCanvas)

    expect(mockStartCameraUseCase.execute).toHaveBeenCalledWith(mockVideo)
    expect(mockStartWorkoutUseCase.execute).toHaveBeenCalledWith(workout)
  })

  it('stop workout calls camera and workout use cases', () => {
    const workout = workoutService.createWorkout()

    workoutService.stopWorkout()

    expect(mockStopCameraUseCase.execute).toHaveBeenCalled()
    expect(mockStopWorkoutUseCase.execute).toHaveBeenCalledWith(workout, undefined)
  })

  it('delegates process frame to use case', () => {
    const mockVideo = {} as HTMLVideoElement
    const mockCanvas = {} as HTMLCanvasElement

    workoutService.processFrame(mockVideo, mockCanvas)

    expect(mockProcessFrameUseCase.execute).toHaveBeenCalledWith(mockVideo, mockCanvas)
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
    const mockVideo = {
      getBoundingClientRect: vi.fn(() => ({ width: 640, height: 480 }))
    } as any
    const mockCanvas = {
      getBoundingClientRect: vi.fn(() => ({ width: 640, height: 480 }))
    } as any
    
    // Mock Date to ensure different IDs
    let dateCallCount = 0
    const originalDate = Date
    vi.stubGlobal('Date', class extends originalDate {
      static toISOString() {
        return `2023-01-01T00:00:${String(dateCallCount++).padStart(2, '0')}.000Z`
      }
      toISOString() {
        return `2023-01-01T00:00:${String(dateCallCount++).padStart(2, '0')}.000Z`
      }
    })
    
    try {
      // Start first workout
      await workoutService.startWorkout(mockVideo, mockCanvas)
      const firstWorkoutId = workoutService.currentWorkout?.id
      
      // Stop the workout
      workoutService.stopWorkout()
      
      // Start again - should create new workout
      await workoutService.startWorkout(mockVideo, mockCanvas)
      const secondWorkoutId = workoutService.currentWorkout?.id
      
      expect(firstWorkoutId).toBeDefined()
      expect(secondWorkoutId).toBeDefined()
      expect(firstWorkoutId).not.toBe(secondWorkoutId)
      expect(workoutService.currentWorkout?.status).toBe('idle') // Still idle since use case is mocked
    } finally {
      vi.unstubAllGlobals()
    }
  })
})