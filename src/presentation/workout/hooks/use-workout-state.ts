import { useState, useEffect } from 'preact/hooks'
import { useEventBus } from '../../hooks/use-event-bus'
import { workoutService } from '@/application/services/workout.service'
import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'
import { WorkoutStatus } from '@/domain/entities/workout-entity'

const DEFAULT_STATS = {
  status: WorkoutStatus.IDLE,
  startTime: null,
  endTime: null,
  canStart: true,
  canStop: false
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