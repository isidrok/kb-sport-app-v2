import { WorkoutEntity, type WorkoutStats } from '@/domain/entities/workout-entity'
import { startWorkoutUseCase, type StartWorkoutUseCase } from '@/application/use-cases/start-workout-use-case'
import { stopWorkoutUseCase, type StopWorkoutUseCase } from '@/application/use-cases/stop-workout-use-case'
import { detectRepUseCase, type DetectRepUseCase } from '@/application/use-cases/detect-rep-use-case'
import { workoutTimerUseCase, type WorkoutTimerUseCase } from '@/application/use-cases/workout-timer-use-case'
import { poseService, type PoseService } from './pose.service'
import { previewService, type PreviewService } from './preview.service'
import { workoutStorageService, type WorkoutStorageService } from './workout-storage.service'

interface WorkoutServiceDependencies {
  startWorkoutUseCase: StartWorkoutUseCase
  stopWorkoutUseCase: StopWorkoutUseCase
  detectRepUseCase: DetectRepUseCase
  workoutTimerUseCase: WorkoutTimerUseCase
  poseService: PoseService
  previewService: PreviewService
  workoutStorageService: WorkoutStorageService
}

/**
 * Application service that coordinates workout management use cases.
 * 
 * This service maintains a workout instance and orchestrates the interaction
 * between pose detection (via PoseService) and workout lifecycle management.
 * 
 * Key responsibilities:
 * - Managing workout lifecycle (create, start, stop)
 * - Delegating pose detection operations to PoseService
 * - Coordinating workout state with pose detection
 * - Providing workout status queries for UI
 */
export class WorkoutService {
  private _currentWorkout: WorkoutEntity | null = null
  private startWorkoutUseCase: StartWorkoutUseCase
  private stopWorkoutUseCase: StopWorkoutUseCase
  private detectRepUseCase: DetectRepUseCase
  private workoutTimerUseCase: WorkoutTimerUseCase
  private poseService: PoseService
  private previewService: PreviewService
  private workoutStorageService: WorkoutStorageService

  constructor(dependencies: WorkoutServiceDependencies) {
    this.startWorkoutUseCase = dependencies.startWorkoutUseCase
    this.stopWorkoutUseCase = dependencies.stopWorkoutUseCase
    this.detectRepUseCase = dependencies.detectRepUseCase
    this.workoutTimerUseCase = dependencies.workoutTimerUseCase
    this.poseService = dependencies.poseService
    this.previewService = dependencies.previewService
    this.workoutStorageService = dependencies.workoutStorageService
  }

  createWorkout(): WorkoutEntity {
    this._currentWorkout = new WorkoutEntity(`workout_${new Date().toISOString()}`)
    return this._currentWorkout
  }

  get currentWorkout(): WorkoutEntity | null {
    return this._currentWorkout
  }

  async startWorkout(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void> {
    // Stop preview if it's running but keep camera for seamless transition
    if (this.previewService.isPreviewActive()) {
      this.previewService.stopPreviewOnly()
    }

    // Always create a new workout when starting
    this.createWorkout()

    await this.poseService.startPoseDetection(videoElement, canvasElement)
    this.startWorkoutUseCase.execute(this._currentWorkout!)
    this.workoutTimerUseCase.start(this._currentWorkout!)

    // Start video recording
    const mediaStream = this.poseService.getMediaStream()
    if (mediaStream && this._currentWorkout) {
      try {
        await this.workoutStorageService.startVideoRecording(this._currentWorkout, mediaStream)
      } catch (error) {
        console.warn('Failed to start video recording:', error)
        // Continue with workout even if recording fails
      }
    }
  }

  async stopWorkout(canvasElement?: HTMLCanvasElement): Promise<void> {
    if (!this._currentWorkout) return
    
    this.poseService.stopPoseDetection(canvasElement)
    this.stopWorkoutUseCase.execute(this._currentWorkout, canvasElement)
    this.workoutTimerUseCase.stop()

    // Save workout data
    try {
      await this.workoutStorageService.stopRecording(this._currentWorkout)
      console.log('Workout saved successfully:', this._currentWorkout.id)
    } catch (error) {
      console.error('Failed to save workout:', error)
      // Even if saving fails, the workout was still completed
    }
  }

  processFrame(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void {
    const prediction = this.poseService.processFrame(videoElement, canvasElement)
    
    // Only perform rep detection when workout is active and we have a prediction
    if (this._currentWorkout && this._currentWorkout.isActive() && prediction) {
      try {
        this.detectRepUseCase.execute({
          prediction,
          workout: this._currentWorkout
        })
      } catch (error) {
        // Continue frame processing even if rep detection fails
        // This ensures the pose visualization continues to work
        console.warn('Rep detection failed:', error)
      }
    }
  }

  getWorkoutStatus(): WorkoutStats | null {
    if (!this._currentWorkout) {
      return null
    }
    return this._currentWorkout.getStats()
  }
}

// Singleton export
export const workoutService = new WorkoutService({
  startWorkoutUseCase,
  stopWorkoutUseCase,
  detectRepUseCase,
  workoutTimerUseCase,
  poseService,
  previewService,
  workoutStorageService
})