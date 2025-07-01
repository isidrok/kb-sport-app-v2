import { Icon } from '@/presentation/components/icon'
import styles from './workout-history-button.module.css'

interface WorkoutHistoryButtonProps {
  onClick: () => void
}

export function WorkoutHistoryButton({ onClick }: WorkoutHistoryButtonProps) {
  return (
    <button 
      className={styles.historyButton} 
      onClick={onClick} 
      data-testid="history-button"
    >
      <Icon name="history" className={styles.buttonIcon} />
    </button>
  )
}