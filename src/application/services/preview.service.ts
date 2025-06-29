import { poseService, type PoseService } from './pose.service'
import { eventBus, type EventBus } from '@/infrastructure/event-bus/event-bus'
import { PreviewStartedEvent, PreviewStoppedEvent } from '@/application/events/preview-events'

interface PreviewServiceDependencies {
  poseService: PoseService
  eventBus: EventBus
}

/**
 * Service that manages preview mode for pose detection testing.
 * Allows users to verify camera setup and pose detection without creating workout records.
 * 
 * Key responsibilities:
 * - Starting and stopping pose detection for preview mode
 * - Publishing preview state change events
 * - Tracking preview active state
 * - Error handling for camera/pose detection failures
 */
export class PreviewService {
  private poseService: PoseService
  private eventBus: EventBus
  private _isPreviewActive: boolean = false

  constructor(dependencies: PreviewServiceDependencies) {
    this.poseService = dependencies.poseService
    this.eventBus = dependencies.eventBus
  }

  async startPreview(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void> {
    try {
      await this.poseService.startPoseDetection(videoElement, canvasElement)
      this._isPreviewActive = true
      
      const event = new PreviewStartedEvent({
        timestamp: new Date().toISOString()
      })
      this.eventBus.publish(event)
    } catch (error) {
      this._isPreviewActive = false
      throw error
    }
  }

  stopPreview(canvasElement?: HTMLCanvasElement): void {
    this.poseService.stopPoseDetection(canvasElement)
    this._isPreviewActive = false
    
    const event = new PreviewStoppedEvent({
      timestamp: new Date().toISOString()
    })
    this.eventBus.publish(event)
  }

  isPreviewActive(): boolean {
    return this._isPreviewActive
  }
}

// Singleton export
export const previewService = new PreviewService({
  poseService,
  eventBus
})