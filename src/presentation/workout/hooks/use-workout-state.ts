import { useState, useEffect } from 'preact/hooks'
import { useEventBus } from '../../hooks/use-event-bus'
import { workoutService } from '@/application/services/workout.service'
import { WorkoutStatusEvent } from '@/domain/events/workout-status-event'

export function useWorkoutState() {
  const [stats, setStats] = useState(() => workoutService.getWorkoutStatus())
  const { subscribe } = useEventBus(WorkoutStatusEvent)

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setStats(workoutService.getWorkoutStatus())
    })
    
    return unsubscribe
  }, [subscribe])

  return stats
}