import { useEffect, useRef } from 'preact/hooks'
import { RefObject } from 'preact'
import { poseService } from '@/application/services/pose.service'
import { WorkoutStatus } from '@/domain/entities/workout-entity'
import { useWorkoutState } from './use-workout-state'
import { usePreview } from '../../hooks/use-preview'

export function useFrameProcessing(
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>
) {
  const animationFrameRef = useRef<number>()
  const { status: workoutStatus } = useWorkoutState()
  const { isPreviewActive } = usePreview(videoRef, canvasRef)

  useEffect(() => {
    const isWorkoutActive = workoutStatus === WorkoutStatus.ACTIVE
    const shouldProcess = isWorkoutActive || isPreviewActive

    const processFrame = () => {
      if (videoRef.current && canvasRef.current && shouldProcess) {
        // Only process if video has a valid stream
        if (videoRef.current.srcObject && videoRef.current.readyState >= 2) {
          poseService.processFrame(videoRef.current, canvasRef.current)
        }
      }
      animationFrameRef.current = requestAnimationFrame(processFrame)
    }

    if (shouldProcess) {
      processFrame()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [workoutStatus, isPreviewActive, videoRef, canvasRef])
}