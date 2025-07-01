import { useEffect } from 'preact/hooks'
import { WorkoutSummary } from '@/domain/types/workout-storage.types'

interface WorkoutHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  workouts: WorkoutSummary[]
  isLoading: boolean
}

export function WorkoutHistoryDrawer({ isOpen, onClose, workouts, isLoading }: WorkoutHistoryDrawerProps) {
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
    <div data-testid="drawer-backdrop" onClick={onClose}>
      <div role="dialog" className="drawer" onClick={(e) => e.stopPropagation()}>
        <h2>Workout History</h2>
        {isLoading ? (
          <div>Loading workouts...</div>
        ) : workouts.length === 0 ? (
          <div>No workouts found</div>
        ) : (
          <div>Workouts loaded</div>
        )}
      </div>
    </div>
  )
}