import { WorkoutSummary } from "@/domain/types/workout-storage.types";
import { formatDateTime } from "@/presentation/format/date";

interface WorkoutCardProps {
  workout: WorkoutSummary;
  onView: (workoutId: string) => void;
  onDownload: (workoutId: string) => void;
  onDelete: (workoutId: string) => void;
}

export function WorkoutCard({
  workout,
  onView,
  onDownload,
  onDelete,
}: WorkoutCardProps) {

  return (
    <div>
      <div>{formatDateTime(workout.startTime)}</div>
      <div>{workout.totalReps} reps</div>
      <div>{workout.rpm} RPM</div>
      <div>{workout.videoSizeInMB} MB</div>
      <div>
        <button onClick={() => onView(workout.workoutId)}>View Video</button>
        <button onClick={() => onDownload(workout.workoutId)}>Download</button>
        <button onClick={() => onDelete(workout.workoutId)}>Delete</button>
      </div>
    </div>
  );
}
