import { useState, useEffect } from 'preact/hooks'
import { useEventBus } from './use-event-bus'
import { workoutService } from '@/application/services/workout.service'
import { CameraAccessEvent } from '@/application/events/camera-access-event'

export function useWorkoutActions() {
  const [cameraError, setCameraError] = useState<string | undefined>(undefined)
  const [isStarting, setIsStarting] = useState(false)
  const { subscribe } = useEventBus(CameraAccessEvent)

  useEffect(() => {
    const unsubscribe = subscribe((event: CameraAccessEvent) => {
      if (event.data.status === 'error') {
        setCameraError(event.data.message)
      } else {
        setCameraError(undefined)
      }
    })
    
    return unsubscribe
  }, [subscribe])

  const startWorkout = async (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => {
    setIsStarting(true)
    try {
      await workoutService.startWorkout(videoElement, canvasElement)
    } finally {
      setIsStarting(false)
    }
  }

  const stopWorkout = () => {
    workoutService.stopWorkout()
  }

  return {
    isStarting,
    startWorkout,
    stopWorkout,
    cameraError
  }
}