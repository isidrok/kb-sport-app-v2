import { Event } from '@/infrastructure/event-bus/event-bus'

export class WorkoutStatusEvent extends Event<{workoutId: string, status: string}> {}