import { WorkoutEntity } from '@/domain/entities/workout-entity'
import { startWorkoutUseCase, type StartWorkoutUseCase } from '@/application/use-cases/start-workout-use-case'
import { stopWorkoutUseCase, type StopWorkoutUseCase } from '@/application/use-cases/stop-workout-use-case'
import { getWorkoutStatusUseCase, type GetWorkoutStatusUseCase, type WorkoutStats } from '@/application/use-cases/get-workout-status-use-case'
import { poseService, type PoseService } from './pose.service'

interface WorkoutServiceDependencies {
  startWorkoutUseCase: StartWorkoutUseCase
  stopWorkoutUseCase: StopWorkoutUseCase
  getWorkoutStatusUseCase: GetWorkoutStatusUseCase
  poseService: PoseService
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
  private getWorkoutStatusUseCase: GetWorkoutStatusUseCase
  private poseService: PoseService

  constructor(dependencies: WorkoutServiceDependencies) {
    this.startWorkoutUseCase = dependencies.startWorkoutUseCase
    this.stopWorkoutUseCase = dependencies.stopWorkoutUseCase
    this.getWorkoutStatusUseCase = dependencies.getWorkoutStatusUseCase
    this.poseService = dependencies.poseService
  }

  createWorkout(): WorkoutEntity {
    this._currentWorkout = new WorkoutEntity(`workout_${new Date().toISOString()}`)
    return this._currentWorkout
  }

  get currentWorkout(): WorkoutEntity | null {
    return this._currentWorkout
  }

  async startWorkout(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void> {
    // Always create a new workout when starting
    this.createWorkout()

    await this.poseService.startPoseDetection(videoElement, canvasElement)
    this.startWorkoutUseCase.execute(this._currentWorkout!)
  }

  stopWorkout(canvasElement?: HTMLCanvasElement): void {
    if (!this._currentWorkout) return
    
    this.poseService.stopPoseDetection(canvasElement)
    this.stopWorkoutUseCase.execute(this._currentWorkout, canvasElement)
  }

  processFrame(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void {
    this.poseService.processFrame(videoElement, canvasElement)
  }

  getWorkoutStatus(): WorkoutStats | null {
    if (!this._currentWorkout) {
      return null
    }
    return this.getWorkoutStatusUseCase.execute(this._currentWorkout)
  }
}

// Singleton export
export const workoutService = new WorkoutService({
  startWorkoutUseCase,
  stopWorkoutUseCase,
  getWorkoutStatusUseCase,
  poseService
})