import { useState, useEffect } from "preact/hooks";
import { useEventBus } from "../../hooks/use-event-bus";
import { workoutService } from "@/application/services/workout.service";
import { WorkoutUpdatedEvent } from "@/domain/events/workout-events";
import {
  WorkoutStatus,
  type WorkoutStats,
} from "@/domain/entities/workout-entity";

const DEFAULT_STATS: WorkoutStats = {
  status: WorkoutStatus.IDLE,
  startTime: null,
  endTime: null,
  isActive: false,
  repCount: 0,
};

export function useWorkoutState() {
  const [stats, setStats] = useState(
    () => workoutService.getWorkoutStatus() || DEFAULT_STATS
  );
  const { subscribe } = useEventBus(WorkoutUpdatedEvent);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      setStats(event.data.stats);
    });

    return unsubscribe;
  }, [subscribe]);

  return stats;
}
