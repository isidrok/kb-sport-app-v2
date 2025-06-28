/**
 * Base event class for type-safe event system.
 * Stores event data and provides common structure for all events.
 */
export abstract class Event<T = any> {
  constructor(public readonly data: T) {}
}