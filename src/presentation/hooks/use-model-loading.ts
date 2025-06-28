import { useState, useEffect } from 'preact/hooks'
import { useEventBus } from './use-event-bus'
import { ModelLoadingEvent } from '@/application/events/model-loading-event'

export function useModelLoading() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState<string | undefined>(undefined)
  const { subscribe } = useEventBus(ModelLoadingEvent)

  useEffect(() => {
    const unsubscribe = subscribe((event: ModelLoadingEvent) => {
      setStatus(event.data.status)
      setMessage(event.data.message)
    })
    
    return unsubscribe
  }, [subscribe])

  return {
    status,
    message
  }
}