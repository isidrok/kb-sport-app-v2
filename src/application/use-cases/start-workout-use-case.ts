import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'
import { EventBus, eventBus } from '@/infrastructure/event-bus/event-bus'
import { WorkoutEntity } from '@/domain/entities/workout-entity'

export class StartWorkoutUseCase {
  constructor(private eventBus: EventBus) {}

  execute(workout: WorkoutEntity): void {
    if (workout.status !== 'idle') {
      throw new Error('Cannot start workout that is not idle')
    }

    workout.start()
    this.eventBus.publish(new WorkoutStatusEvent({
      workoutId: workout.id,
      status: workout.status
    }))
  }
}

// Export singleton instance
export const startWorkoutUseCase = new StartWorkoutUseCase(eventBus)