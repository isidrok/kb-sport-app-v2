import { repDetectionService, type RepDetectionService } from '@/domain/services/rep-detection.service'
import { eventBus, type EventBus } from '@/infrastructure/event-bus/event-bus'
import { WorkoutEntity } from '@/domain/entities/workout-entity'
import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'
import { type Prediction } from '@/domain/types/rep-detection.types'

interface DetectRepUseCaseDependencies {
  repDetectionService: RepDetectionService
  eventBus: EventBus
}

interface DetectRepParams {
  prediction: Prediction
  workout: WorkoutEntity
}

interface DetectRepResult {
  repDetected: boolean
  totalReps: number
}

export class DetectRepUseCase {
  constructor(private dependencies: DetectRepUseCaseDependencies) {}

  execute(params: DetectRepParams): DetectRepResult {
    const rep = this.dependencies.repDetectionService.detectRep(params.prediction)
    
    if (rep) {
      params.workout.addRep(rep)
      
      this.dependencies.eventBus.publish(new WorkoutStatusEvent({
        workoutId: params.workout.id,
        status: params.workout.status
      }))
      
      return {
        repDetected: true,
        totalReps: params.workout.getRepCount()
      }
    }
    
    return {
      repDetected: false,
      totalReps: params.workout.getRepCount()
    }
  }
}

// Export singleton instance
export const detectRepUseCase = new DetectRepUseCase({
  repDetectionService,
  eventBus
})