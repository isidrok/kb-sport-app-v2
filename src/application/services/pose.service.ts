import { startCameraUseCase, type StartCameraUseCase } from '@/application/use-cases/start-camera-use-case'
import { stopCameraUseCase, type StopCameraUseCase } from '@/application/use-cases/stop-camera-use-case'
import { processFrameUseCase, type ProcessFrameUseCase } from '@/application/use-cases/process-frame-use-case'
import { predictionRendererAdapter, type PredictionRendererAdapter } from '@/infrastructure/adapters/prediction-renderer.adapter'
import { type Prediction } from '@/domain/types/rep-detection.types'

interface PoseServiceDependencies {
  startCameraUseCase: StartCameraUseCase
  stopCameraUseCase: StopCameraUseCase
  processFrameUseCase: ProcessFrameUseCase
  rendererAdapter: PredictionRendererAdapter
}

/**
 * Service that manages pose detection lifecycle including camera operations and frame processing.
 * This service is used by both WorkoutService and PreviewService to share pose detection functionality.
 * 
 * Key responsibilities:
 * - Setting video/canvas dimensions before camera initialization
 * - Starting and stopping camera operations
 * - Delegating frame processing to ML use cases
 * - Tracking active state of pose detection
 * - Clearing canvas on stop
 */
export class PoseService {
  private startCameraUseCase: StartCameraUseCase
  private stopCameraUseCase: StopCameraUseCase
  private processFrameUseCase: ProcessFrameUseCase
  private rendererAdapter: PredictionRendererAdapter
  private _isActive: boolean = false

  constructor(dependencies: PoseServiceDependencies) {
    this.startCameraUseCase = dependencies.startCameraUseCase
    this.stopCameraUseCase = dependencies.stopCameraUseCase
    this.processFrameUseCase = dependencies.processFrameUseCase
    this.rendererAdapter = dependencies.rendererAdapter
  }

  async startPoseDetection(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void> {
    const videoRect = videoElement.getBoundingClientRect()
    const canvasRect = canvasElement.getBoundingClientRect()
    
    videoElement.width = videoRect.width
    videoElement.height = videoRect.height
    canvasElement.width = canvasRect.width
    canvasElement.height = canvasRect.height

    // Only start camera if not already active (for seamless preview->workout transition)
    if (!this._isActive) {
      await this.startCameraUseCase.execute(videoElement)
    }
    
    this._isActive = true
  }

  stopPoseDetection(canvasElement?: HTMLCanvasElement): void {
    this.stopCameraUseCase.execute()
    this._isActive = false
    
    if (canvasElement) {
      this.rendererAdapter.clear(canvasElement)
    }
  }

  processFrame(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Prediction | null {
    return this.processFrameUseCase.execute(videoElement, canvasElement)
  }

  isActive(): boolean {
    return this._isActive
  }
}

// Singleton export
export const poseService = new PoseService({
  startCameraUseCase: startCameraUseCase,
  stopCameraUseCase: stopCameraUseCase,
  processFrameUseCase: processFrameUseCase,
  rendererAdapter: predictionRendererAdapter
})