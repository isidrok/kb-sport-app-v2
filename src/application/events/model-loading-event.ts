import { Event } from '@/infrastructure/event-bus/event-bus'

export class ModelLoadingEvent extends Event<{status: 'loading' | 'ready' | 'error', message?: string}> {}