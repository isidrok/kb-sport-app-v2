import { Icon } from '@/presentation/components/icon'

interface WorkoutHistoryButtonProps {
  onClick: () => void
}

export function WorkoutHistoryButton({ onClick }: WorkoutHistoryButtonProps) {
  return (
    <button onClick={onClick} data-testid="history-button">
      <Icon name="history" />
    </button>
  )
}