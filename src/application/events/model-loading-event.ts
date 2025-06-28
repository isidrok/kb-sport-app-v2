import { Event } from '@/infrastructure/event-bus/event'

export class ModelLoadingEvent extends Event<{status: 'loading' | 'ready' | 'error', message?: string}> {}