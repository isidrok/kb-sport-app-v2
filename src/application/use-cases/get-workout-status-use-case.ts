import { WorkoutEntity, WorkoutStatus } from '@/domain/entities/workout-entity'

export interface WorkoutStats {
  status: WorkoutStatus
  startTime: Date | null
  endTime: Date | null
  canStart: boolean
  canStop: boolean
}

export class GetWorkoutStatusUseCase {
  execute(workout: WorkoutEntity): WorkoutStats {
    return {
      status: workout.status,
      startTime: workout.startTime,
      endTime: workout.endTime,
      canStart: workout.status === WorkoutStatus.IDLE || workout.status === WorkoutStatus.STOPPED,
      canStop: workout.status === WorkoutStatus.ACTIVE
    }
  }
}

// Export singleton instance
export const getWorkoutStatusUseCase = new GetWorkoutStatusUseCase()