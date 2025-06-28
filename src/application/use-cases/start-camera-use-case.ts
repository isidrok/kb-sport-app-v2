import { CameraAccessEvent } from '@/application/events/camera-access-event'
import { EventBus, eventBus } from '@/infrastructure/event-bus/event-bus'
import { CameraAdapter, cameraAdapter } from '@/infrastructure/adapters/camera.adapter'

export class StartCameraUseCase {
  constructor(
    private cameraAdapter: CameraAdapter,
    private eventBus: EventBus
  ) {}

  async execute(videoElement: HTMLVideoElement): Promise<void> {
    // Publish requesting event
    this.eventBus.publish(new CameraAccessEvent({ status: 'requesting' }))
    
    try {
      // Start camera
      await this.cameraAdapter.start(videoElement)
      
      // Publish ready event
      this.eventBus.publish(new CameraAccessEvent({ status: 'ready' }))
    } catch (error) {
      // Publish error event
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.eventBus.publish(new CameraAccessEvent({ status: 'error', message }))
      
      // Re-throw to maintain error propagation
      throw error
    }
  }
}

// Export singleton instance
export const startCameraUseCase = new StartCameraUseCase(cameraAdapter, eventBus)