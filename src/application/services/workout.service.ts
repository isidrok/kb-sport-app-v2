import { WorkoutEntity } from '@/domain/entities/workout-entity'
import { startCameraUseCase, type StartCameraUseCase } from '@/application/use-cases/start-camera-use-case'
import { stopCameraUseCase, type StopCameraUseCase } from '@/application/use-cases/stop-camera-use-case'
import { startWorkoutUseCase, type StartWorkoutUseCase } from '@/application/use-cases/start-workout-use-case'
import { stopWorkoutUseCase, type StopWorkoutUseCase } from '@/application/use-cases/stop-workout-use-case'
import { processFrameUseCase, type ProcessFrameUseCase } from '@/application/use-cases/process-frame-use-case'
import { getWorkoutStatusUseCase, type GetWorkoutStatusUseCase, type WorkoutStats } from '@/application/use-cases/get-workout-status-use-case'

interface WorkoutServiceDependencies {
  startCameraUseCase: StartCameraUseCase
  stopCameraUseCase: StopCameraUseCase
  startWorkoutUseCase: StartWorkoutUseCase
  stopWorkoutUseCase: StopWorkoutUseCase
  processFrameUseCase: ProcessFrameUseCase
  getWorkoutStatusUseCase: GetWorkoutStatusUseCase
}

/**
 * Application service that coordinates workout management use cases.
 * 
 * This service maintains a workout instance and orchestrates the interaction
 * between camera operations, workout lifecycle management, and frame processing
 * for pose detection.
 * 
 * Key responsibilities:
 * - Managing workout lifecycle (create, start, stop)
 * - Coordinating camera operations with workout state
 * - Setting video/canvas dimensions before camera initialization
 * - Delegating frame processing to ML use cases
 * - Providing workout status queries for UI
 */
export class WorkoutService {
  private _currentWorkout: WorkoutEntity | null = null
  private startCameraUseCase: StartCameraUseCase
  private stopCameraUseCase: StopCameraUseCase
  private startWorkoutUseCase: StartWorkoutUseCase
  private stopWorkoutUseCase: StopWorkoutUseCase
  private processFrameUseCase: ProcessFrameUseCase
  private getWorkoutStatusUseCase: GetWorkoutStatusUseCase

  constructor(dependencies: WorkoutServiceDependencies) {
    this.startCameraUseCase = dependencies.startCameraUseCase
    this.stopCameraUseCase = dependencies.stopCameraUseCase
    this.startWorkoutUseCase = dependencies.startWorkoutUseCase
    this.stopWorkoutUseCase = dependencies.stopWorkoutUseCase
    this.processFrameUseCase = dependencies.processFrameUseCase
    this.getWorkoutStatusUseCase = dependencies.getWorkoutStatusUseCase
  }

  createWorkout(): WorkoutEntity {
    this._currentWorkout = new WorkoutEntity(`workout_${new Date().toISOString()}`)
    return this._currentWorkout
  }

  get currentWorkout(): WorkoutEntity {
    if (!this._currentWorkout) {
      throw new Error('No workout created. Call createWorkout() first.')
    }
    return this._currentWorkout
  }

  async startWorkout(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void> {
    this.setElementDimensions(videoElement, canvasElement)

    await this.startCameraUseCase.execute(videoElement)
    this.startWorkoutUseCase.execute(this.currentWorkout)
  }

  private setElementDimensions(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void {
    const videoRect = videoElement.getBoundingClientRect()
    const canvasRect = canvasElement.getBoundingClientRect()
    
    videoElement.width = videoRect.width
    videoElement.height = videoRect.height
    canvasElement.width = canvasRect.width
    canvasElement.height = canvasRect.height
  }

  stopWorkout(): void {
    this.stopCameraUseCase.execute()
    this.stopWorkoutUseCase.execute(this.currentWorkout)
  }

  processFrame(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void {
    this.processFrameUseCase.execute(videoElement, canvasElement)
  }

  getWorkoutStatus(): WorkoutStats {
    return this.getWorkoutStatusUseCase.execute(this.currentWorkout)
  }
}

// Singleton export
export const workoutService = new WorkoutService({
  startCameraUseCase,
  stopCameraUseCase,
  startWorkoutUseCase,
  stopWorkoutUseCase,
  processFrameUseCase,
  getWorkoutStatusUseCase
})