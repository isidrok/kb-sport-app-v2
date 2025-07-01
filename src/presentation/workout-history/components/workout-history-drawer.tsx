import { useEffect } from 'preact/hooks'
import { WorkoutSummary } from '@/domain/types/workout-storage.types'
import { WorkoutCard } from './workout-card'
import { useWorkoutHistory } from '../../hooks/use-workout-history'
import { Icon } from '@/presentation/components/icon'
import styles from './workout-history-drawer.module.css'

interface WorkoutHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  workouts: WorkoutSummary[]
  isLoading: boolean
}

export function WorkoutHistoryDrawer({ isOpen, onClose, workouts, isLoading }: WorkoutHistoryDrawerProps) {
  const { viewWorkout, downloadWorkout, deleteWorkout } = useWorkoutHistory()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.backdrop} data-testid="drawer-backdrop" onClick={onClose}>
      <div role="dialog" className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Workout History</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        
        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.loadingIcon}>
                <Icon name="hourglass_empty" />
              </div>
              <div className={styles.loadingText}>Loading workouts...</div>
              <div className={styles.loadingSubtext}>Please wait while we fetch your workout history</div>
            </div>
          ) : workouts.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <Icon name="fitness_center" />
              </div>
              <div className={styles.emptyText}>No workouts found</div>
              <div className={styles.emptySubtext}>Start your first workout to see it here</div>
            </div>
          ) : (
            <div className={styles.workoutList}>
              {workouts.map((workout) => (
                <WorkoutCard
                  key={workout.workoutId}
                  workout={workout}
                  onView={viewWorkout}
                  onDownload={downloadWorkout}
                  onDelete={deleteWorkout}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}