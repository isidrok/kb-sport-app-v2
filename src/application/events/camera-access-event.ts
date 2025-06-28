import { Event } from '@/infrastructure/event-bus/event-bus'

export class CameraAccessEvent extends Event<{status: 'requesting' | 'ready' | 'error', message?: string}> {}