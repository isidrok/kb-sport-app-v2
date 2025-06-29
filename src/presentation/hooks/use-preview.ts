import { useState, useEffect } from 'preact/hooks'
import { RefObject } from 'preact'
import { previewService } from '@/application/services/preview.service'
import { eventBus } from '@/infrastructure/event-bus/event-bus'
import { PreviewStartedEvent, PreviewStoppedEvent } from '@/application/events/preview-events'

export interface UsePreviewReturn {
  isPreviewActive: boolean
  startPreview: () => Promise<void>
  stopPreview: () => void
  error: string | null
}

export function usePreview(
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>
): UsePreviewReturn {
  const [isPreviewActive, setIsPreviewActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeStarted = eventBus.subscribe(PreviewStartedEvent, () => {
      setIsPreviewActive(true)
    })
    
    const unsubscribeStopped = eventBus.subscribe(PreviewStoppedEvent, () => {
      setIsPreviewActive(false)
    })

    return () => {
      unsubscribeStarted()
      unsubscribeStopped()
    }
  }, [])

  const startPreview = async () => {
    if (!videoRef.current || !canvasRef.current) return
    
    try {
      setError(null)
      await previewService.startPreview(videoRef.current, canvasRef.current)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const stopPreview = () => {
    if (!canvasRef.current) return
    
    previewService.stopPreview(canvasRef.current)
  }

  return {
    isPreviewActive,
    startPreview,
    stopPreview,
    error
  }
}