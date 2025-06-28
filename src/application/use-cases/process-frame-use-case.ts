import { PredictionAdapter, predictionAdapter } from '@/infrastructure/adapters/prediction.adapter'
import { PredictionRendererAdapter, predictionRendererAdapter } from '@/infrastructure/adapters/prediction-renderer.adapter'

export class ProcessFrameUseCase {
  constructor(
    private predictionAdapter: PredictionAdapter,
    private rendererAdapter: PredictionRendererAdapter
  ) {}

  execute(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void {
    if (!this.predictionAdapter.isInitialized()) {
      return
    }

    const result = this.predictionAdapter.process(videoElement)
    if (!result) {
      return
    }
    
    this.rendererAdapter.render({
      source: videoElement,
      target: canvasElement,
      prediction: result.bestPrediction,
      confidenceThreshold: 0.5
    })
  }
}

// Export singleton instance
export const processFrameUseCase = new ProcessFrameUseCase(predictionAdapter, predictionRendererAdapter)