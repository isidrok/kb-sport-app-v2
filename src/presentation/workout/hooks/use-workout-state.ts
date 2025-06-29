import { useState, useEffect } from 'preact/hooks'
import { useEventBus } from '../../hooks/use-event-bus'
import { workoutService } from '@/application/services/workout.service'
import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'
import { WorkoutStatus } from '@/domain/entities/workout-entity'
import { type WorkoutStats } from '@/application/use-cases/get-workout-status-use-case'

const DEFAULT_STATS: WorkoutStats = {
  status: WorkoutStatus.IDLE,
  startTime: null,
  endTime: null,
  canStart: true,
  canStop: false,
  repCount: 0
}

export function useWorkoutState() {
  const [stats, setStats] = useState(() => workoutService.getWorkoutStatus() || DEFAULT_STATS)
  const { subscribe } = useEventBus(WorkoutStatusEvent)

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setStats(workoutService.getWorkoutStatus() || DEFAULT_STATS)
    })
    
    return unsubscribe
  }, [subscribe])

  return stats
}