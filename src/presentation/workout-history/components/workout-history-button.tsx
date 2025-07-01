import { Icon } from '@/presentation/components/icon'

interface WorkoutHistoryButtonProps {
  onClick: () => void
  workoutCount?: number
}

export function WorkoutHistoryButton({ onClick, workoutCount }: WorkoutHistoryButtonProps) {
  return (
    <button onClick={onClick}>
      <Icon name="history" />
      {workoutCount && workoutCount > 0 && (
        <span>{workoutCount}</span>
      )}
    </button>
  )
}