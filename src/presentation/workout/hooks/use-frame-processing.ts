import { useEffect, useRef } from 'preact/hooks'
import { RefObject } from 'preact'
import { workoutService } from '@/application/services/workout.service'
import { WorkoutStatus } from '@/domain/entities/workout-entity'
import { useWorkoutState } from './use-workout-state'

export function useFrameProcessing(
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>
) {
  const animationFrameRef = useRef<number>()
  const { status: workoutStatus } = useWorkoutState()

  useEffect(() => {
    const processFrame = () => {
      if (videoRef.current && canvasRef.current && workoutStatus === WorkoutStatus.ACTIVE) {
        workoutService.processFrame(videoRef.current, canvasRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(processFrame)
    }

    if (workoutStatus === WorkoutStatus.ACTIVE) {
      processFrame()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [workoutStatus, videoRef, canvasRef])
}