import { Event } from '@/infrastructure/event-bus/event'
import { type WorkoutStats } from '../entities/workout-entity'

export class WorkoutUpdatedEvent extends Event<{workoutId: string, stats: WorkoutStats}> {}