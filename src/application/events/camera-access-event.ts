import { Event } from '@/infrastructure/event-bus/event'

export class CameraAccessEvent extends Event<{status: 'requesting' | 'ready' | 'error', message?: string}> {}