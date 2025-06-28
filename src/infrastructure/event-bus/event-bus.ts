/**
 * Base event class for type-safe event system.
 * Stores event data and provides common structure for all events.
 */
export abstract class Event<T = any> {
  constructor(public readonly data: T) {}
}

/**
 * Lightweight event bus for async communication between layers.
 * 
 * Supports:
 * - Type-safe event subscription and publishing
 * - Enforces all events extend base Event class
 * - Multiple listeners per event type
 * - Automatic cleanup via unsubscribe functions
 * - Memory leak prevention through proper listener management
 */
export class EventBus {
  private listeners: Map<string, Function[]> = new Map()

  subscribe<T extends Event>(eventType: string, listener: (event: T) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    
    this.listeners.get(eventType)!.push(listener)
    
    return () => {
      const eventListeners = this.listeners.get(eventType)
      if (eventListeners) {
        const index = eventListeners.indexOf(listener)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    }
  }

  publish<T extends Event>(eventType: string, event: T): void {
    const eventListeners = this.listeners.get(eventType)
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event))
    }
  }
}

export const eventBus = new EventBus()