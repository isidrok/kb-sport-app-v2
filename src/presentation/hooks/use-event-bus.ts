import { useCallback, useEffect, useRef } from 'preact/hooks'
import { eventBus } from '@/infrastructure/event-bus/event-bus'
import { Event } from '@/infrastructure/event-bus/event'

/**
 * Hook for easy event subscription/publishing from components.
 * 
 * Features:
 * - Type-safe event publishing and subscription
 * - Enforces events extend base Event class
 * - Automatic cleanup of listeners on component unmount
 * - Multiple subscription support with proper cleanup
 * - Delegates to singleton EventBus for app-wide communication
 * 
 * @param eventClass - The event class to subscribe/publish to
 * @returns Object with publish and subscribe functions
 */
export function useEventBus<T extends Event>(eventClass: new (...args: any[]) => T): {
  publish: (event: T) => void
  subscribe: (listener: (event: T) => void) => void
} {
  const unsubscribeRefs = useRef<(() => void)[]>([])

  const publish = useCallback((event: T) => {
    eventBus.publish(event)
  }, [])

  const subscribe = useCallback((listener: (event: T) => void) => {
    const unsubscribe = eventBus.subscribe(eventClass, listener)
    unsubscribeRefs.current.push(unsubscribe)
  }, [eventClass])

  useEffect(() => {
    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe())
      unsubscribeRefs.current = []
    }
  }, [])

  return { publish, subscribe }
}