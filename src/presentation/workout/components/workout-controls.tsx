import { RefObject } from 'preact'
import { useWorkoutState } from '../hooks/use-workout-state'
import { useWorkoutActions } from '../hooks/use-workout-actions'

interface WorkoutControlsProps {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
}

export function WorkoutControls({ videoRef, canvasRef }: WorkoutControlsProps) {
  const { canStart, canStop } = useWorkoutState()
  const { startWorkout, stopWorkout, isStarting } = useWorkoutActions()

  const handleClick = async () => {
    if (canStart && videoRef.current && canvasRef.current) {
      await startWorkout(videoRef.current, canvasRef.current)
    } else if (canStop) {
      stopWorkout()
    }
  }

  return (
    <button disabled={isStarting} onClick={handleClick}>
      {canStart ? 'Start' : 'Stop'}
    </button>
  )
}