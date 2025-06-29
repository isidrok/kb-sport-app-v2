import { EventBus, eventBus } from '@/infrastructure/event-bus/event-bus'
import { WorkoutEntity } from '@/domain/entities/workout-entity'

export class StartWorkoutUseCase {
  constructor(private eventBus: EventBus) {}

  execute(workout: WorkoutEntity): void {
    const event = workout.start()
    this.eventBus.publish(event)
  }
}

// Export singleton instance
export const startWorkoutUseCase = new StartWorkoutUseCase(eventBus)