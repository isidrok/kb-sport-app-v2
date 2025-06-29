import { RefObject } from 'preact'
import { useWorkoutState } from '../hooks/use-workout-state'
import { useWorkoutActions } from '../hooks/use-workout-actions'
import { usePreview } from '../../hooks/use-preview'
import { WorkoutButton } from './workout-button'
import { PreviewButton } from '../../components/preview-button'
import styles from './workout-controls.module.css'

interface WorkoutControlsProps {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
}

export function WorkoutControls({ videoRef, canvasRef }: WorkoutControlsProps) {
  const { canStart, canStop } = useWorkoutState()
  const { startWorkout, stopWorkout, isStarting } = useWorkoutActions()
  const { isPreviewActive, startPreview, stopPreview } = usePreview(videoRef, canvasRef)

  const handleStartWorkout = async () => {
    if (videoRef.current && canvasRef.current) {
      await startWorkout(videoRef.current, canvasRef.current)
    }
  }

  const handleStopWorkout = () => {
    if (canvasRef.current) {
      stopWorkout(canvasRef.current)
    }
  }

  return (
    <div className={styles.container}>
      <PreviewButton
        isPreviewActive={isPreviewActive}
        isDisabled={canStop}
        onStartPreview={startPreview}
        onStopPreview={stopPreview}
      />
      <WorkoutButton
        canStart={canStart}
        canStop={canStop}
        isStarting={isStarting}
        onStartWorkout={handleStartWorkout}
        onStopWorkout={handleStopWorkout}
      />
    </div>
  )
}