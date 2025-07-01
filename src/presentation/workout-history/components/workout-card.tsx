import { WorkoutSummary } from "@/domain/types/workout-storage.types";
import { formatDateTime } from "@/presentation/format/date";
import { Icon } from "@/presentation/components/icon";
import styles from "./workout-card.module.css";

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
  // Calculate workout duration
  const duration = workout.endTime 
    ? Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 1000 / 60)
    : 0;

  return (
    <div className={styles.card}>
      <div className={styles.videoSize}>
        {workout.videoSizeInMB.toFixed(1)} MB
      </div>
      
      <div className={styles.header}>
        <div className={styles.date}>
          {formatDateTime(workout.startTime)}
        </div>
        <div className={styles.duration}>
          <Icon name="schedule" />
          {duration}m
        </div>
      </div>
      
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{workout.totalReps}</div>
          <div className={styles.statLabel}>Reps</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{workout.rpm}</div>
          <div className={styles.statLabel}>RPM</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{duration}</div>
          <div className={styles.statLabel}>Min</div>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button 
          className={`${styles.actionButton} ${styles.viewButton}`}
          onClick={() => onView(workout.workoutId)}
        >
          <Icon name="play_arrow" className={styles.buttonIcon} />
          View
        </button>
        <button 
          className={`${styles.actionButton} ${styles.downloadButton}`}
          onClick={() => onDownload(workout.workoutId)}
        >
          <Icon name="download" className={styles.buttonIcon} />
          Download
        </button>
        <button 
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={() => onDelete(workout.workoutId)}
        >
          <Icon name="delete" className={styles.buttonIcon} />
          Delete
        </button>
      </div>
    </div>
  );
}
