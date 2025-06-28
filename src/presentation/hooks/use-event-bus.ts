import { useCallback } from 'preact/hooks'
import { eventBus } from '@/infrastructure/event-bus/event-bus'
import { Event } from '@/infrastructure/event-bus/event'

/**
 * Hook for easy event subscription/publishing from components.
 * 
 * Features:
 * - Type-safe event publishing and subscription
 * - Enforces events extend base Event class
 * - Manual subscription with unsubscribe function
 * - Delegates to singleton EventBus for app-wide communication
 * 
 * @param eventClass - The event class to subscribe/publish to
 * @returns Object with publish and subscribe functions
 */
export function useEventBus<T extends Event>(eventClass: new (...args: any[]) => T): {
  publish: (event: T) => void
  subscribe: (listener: (event: T) => void) => () => void
} {
  const publish = useCallback((event: T) => {
    eventBus.publish(event)
  }, [])

  const subscribe = useCallback((listener: (event: T) => void) => {
    return eventBus.subscribe(eventClass, listener)
  }, [eventClass])

  return { publish, subscribe }
}