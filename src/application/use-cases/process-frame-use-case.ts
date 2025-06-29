import { PredictionAdapter, predictionAdapter } from '@/infrastructure/adapters/prediction.adapter'
import { PredictionRendererAdapter, predictionRendererAdapter } from '@/infrastructure/adapters/prediction-renderer.adapter'
import { type Prediction } from '@/domain/types/rep-detection.types'

export class ProcessFrameUseCase {
  constructor(
    private predictionAdapter: PredictionAdapter,
    private rendererAdapter: PredictionRendererAdapter
  ) {}

  execute(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Prediction | null {
    if (!this.predictionAdapter.isInitialized()) {
      return null
    }

    const result = this.predictionAdapter.process(videoElement)
    if (!result) {
      return null
    }
    
    this.rendererAdapter.render({
      source: videoElement,
      target: canvasElement,
      prediction: result.bestPrediction,
      confidenceThreshold: 0.5
    })
    
    return result.bestPrediction
  }
}

// Export singleton instance
export const processFrameUseCase = new ProcessFrameUseCase(predictionAdapter, predictionRendererAdapter)