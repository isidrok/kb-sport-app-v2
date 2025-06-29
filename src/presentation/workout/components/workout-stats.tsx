import { useWorkoutState } from '../hooks/use-workout-state'
import { WorkoutStatsCard } from './workout-stats-card'
import styles from './workout-stats.module.css'

interface WorkoutStatsProps {
  workoutId: string
}

export function WorkoutStats({ }: WorkoutStatsProps) {
  const stats = useWorkoutState()

  return (
    <div className={styles.overlay}>
      <WorkoutStatsCard value={stats.repCount} label="Reps" />
    </div>
  )
}