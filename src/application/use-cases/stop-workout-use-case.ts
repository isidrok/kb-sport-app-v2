import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'
import { EventBus, eventBus } from '@/infrastructure/event-bus/event-bus'
import { WorkoutEntity } from '@/domain/entities/workout-entity'

export class StopWorkoutUseCase {
  constructor(private eventBus: EventBus) {}

  execute(workout: WorkoutEntity): void {
    if (workout.status !== 'active') {
      throw new Error('Cannot stop workout that is not active')
    }

    workout.stop()
    this.eventBus.publish(new WorkoutStatusEvent({
      workoutId: workout.id,
      status: workout.status
    }))
  }
}

// Export singleton instance
export const stopWorkoutUseCase = new StopWorkoutUseCase(eventBus)