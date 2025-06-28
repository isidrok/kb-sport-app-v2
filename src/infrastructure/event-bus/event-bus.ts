import type { Event } from './event'

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
  private listeners: Map<Function, Function[]> = new Map()

  subscribe<T extends Event>(eventClass: new (...args: any[]) => T, listener: (event: T) => void): () => void {
    if (!this.listeners.has(eventClass)) {
      this.listeners.set(eventClass, [])
    }
    
    this.listeners.get(eventClass)!.push(listener)
    
    return () => {
      const eventListeners = this.listeners.get(eventClass)
      if (eventListeners) {
        const index = eventListeners.indexOf(listener)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    }
  }

  publish<T extends Event>(event: T): void {
    const eventClass = event.constructor
    const eventListeners = this.listeners.get(eventClass)
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event))
    }
  }
}

export const eventBus = new EventBus()