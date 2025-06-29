import { EventBus, eventBus } from '@/infrastructure/event-bus/event-bus'
import { WorkoutEntity } from '@/domain/entities/workout-entity'
import { PredictionRendererAdapter, predictionRendererAdapter } from '@/infrastructure/adapters/prediction-renderer.adapter'

export class StopWorkoutUseCase {
  constructor(
    private eventBus: EventBus,
    private rendererAdapter: PredictionRendererAdapter
  ) {}

  execute(workout: WorkoutEntity, canvasElement?: HTMLCanvasElement): void {
    const event = workout.stop()
    
    // Clear canvas overlay
    if (canvasElement) {
      this.rendererAdapter.clear(canvasElement)
    }
    
    this.eventBus.publish(event)
  }
}

// Export singleton instance
export const stopWorkoutUseCase = new StopWorkoutUseCase(eventBus, predictionRendererAdapter)