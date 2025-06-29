import { Event } from '@/infrastructure/event-bus/event'

export interface PreviewStartedEventData {
  timestamp: string
}

export interface PreviewStoppedEventData {
  timestamp: string
}

export class PreviewStartedEvent extends Event<PreviewStartedEventData> {}

export class PreviewStoppedEvent extends Event<PreviewStoppedEventData> {}