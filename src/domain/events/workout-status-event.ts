import { Event } from '@/infrastructure/event-bus/event'

export class WorkoutStatusEvent extends Event<{workoutId: string, status: string}> {}