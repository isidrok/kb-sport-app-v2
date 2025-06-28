import { CameraAdapter, cameraAdapter } from '@/infrastructure/adapters/camera.adapter'

export class StopCameraUseCase {
  constructor(private cameraAdapter: CameraAdapter) {}

  execute(): void {
    this.cameraAdapter.stop()
  }
}

// Export singleton instance
export const stopCameraUseCase = new StopCameraUseCase(cameraAdapter)