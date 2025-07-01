import { WorkoutSummary } from '@/domain/types/workout-storage.types'
import { formatDateTime } from '@/presentation/format/date'

interface DeleteConfirmationModalProps {
  workout: WorkoutSummary | null
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmationModal({ workout, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  if (!workout) {
    return null
  }

  return (
    <div role="dialog">
      <h2>Delete Workout</h2>
      <p>Are you sure you want to delete this workout?</p>
      <div>{formatDateTime(workout.startTime)}</div>
      <div>{workout.videoSizeInMB} MB</div>
      <div>
        <button onClick={onConfirm}>Delete</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}