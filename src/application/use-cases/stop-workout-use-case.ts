import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'
import { EventBus, eventBus } from '@/infrastructure/event-bus/event-bus'
import { WorkoutEntity } from '@/domain/entities/workout-entity'
import { PredictionRendererAdapter, predictionRendererAdapter } from '@/infrastructure/adapters/prediction-renderer.adapter'

export class StopWorkoutUseCase {
  constructor(
    private eventBus: EventBus,
    private rendererAdapter: PredictionRendererAdapter
  ) {}

  execute(workout: WorkoutEntity, canvasElement?: HTMLCanvasElement): void {
    if (workout.status !== 'active') {
      throw new Error('Cannot stop workout that is not active')
    }

    workout.stop()
    
    // Clear canvas overlay
    if (canvasElement) {
      this.rendererAdapter.clear(canvasElement)
    }
    
    this.eventBus.publish(new WorkoutStatusEvent({
      workoutId: workout.id,
      status: workout.status
    }))
  }
}

// Export singleton instance
export const stopWorkoutUseCase = new StopWorkoutUseCase(eventBus, predictionRendererAdapter)