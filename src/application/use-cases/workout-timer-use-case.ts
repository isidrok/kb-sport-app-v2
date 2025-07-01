import { type EventBus, eventBus } from "@/infrastructure/event-bus/event-bus";
import { type WorkoutEntity } from "@/domain/entities/workout-entity";
import { WorkoutUpdatedEvent } from "@/domain/events/workout-events";

interface WorkoutTimerUseCaseDependencies {
  eventBus: EventBus;
}

export class WorkoutTimerUseCase {
  private eventBus: EventBus;
  private timerInterval: NodeJS.Timeout | null = null;
  private currentWorkout: WorkoutEntity | null = null;

  constructor(dependencies: WorkoutTimerUseCaseDependencies) {
    this.eventBus = dependencies.eventBus;
  }

  start(workout: WorkoutEntity): void {
    // Clear any existing timer to handle multiple start calls
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.currentWorkout = workout;
    
    // Start timer that checks every second
    this.timerInterval = setInterval(() => {
      // Only emit events if the workout is still active
      if (this.currentWorkout && this.currentWorkout.isActive()) {
        const stats = this.currentWorkout.getStats();
        const event = new WorkoutUpdatedEvent({
          workoutId: this.currentWorkout.id,
          stats
        });
        this.eventBus.publish(event);
      }
    }, 1000);
  }

  stop(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.currentWorkout = null;
  }
}

// Export singleton instance
export const workoutTimerUseCase = new WorkoutTimerUseCase({ eventBus });