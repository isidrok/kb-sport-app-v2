import { WorkoutSummary } from "@/domain/types/workout-storage.types";
import { formatDateTime } from "@/presentation/format/date";
import { Icon } from "@/presentation/components/icon";
import styles from "./workout-card.module.css";

interface WorkoutCardProps {
  workout: WorkoutSummary;
  onView: (workoutId: string) => void;
  onDownload: (workoutId: string) => void;
  onDelete: (workoutId: string) => void;
  isDeleting?: boolean;
  onConfirmDelete: (workoutId: string) => void;
  onCancelDelete: () => void;
}

export function WorkoutCard({
  workout,
  onView,
  onDownload,
  onDelete,
  isDeleting = false,
  onConfirmDelete,
  onCancelDelete,
}: WorkoutCardProps) {
  // Calculate workout duration in seconds and format as mm:ss
  const durationInSeconds = workout.endTime
    ? Math.round(
        (new Date(workout.endTime).getTime() -
          new Date(workout.startTime).getTime()) /
          1000
      )
    : 0;

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const duration = formatDuration(durationInSeconds);

  if (isDeleting) {
    return (
      <div className={`${styles.card} ${styles.deleteConfirmation}`}>
        <div className={styles.deleteMessage}>
          <Icon name="warning" className={styles.warningIcon} />
          <h3>Delete Workout?</h3>
          <p>Are you sure you want to delete this workout?</p>
          <div className={styles.workoutInfo}>
            <div>{formatDateTime(workout.startTime)}</div>
            <div>{workout.videoSizeInMB.toFixed(1)} MB</div>
          </div>
        </div>
        
        <div className={styles.confirmActions}>
          <button
            className={`${styles.actionButton} ${styles.confirmButton}`}
            onClick={() => onConfirmDelete(workout.workoutId)}
          >
            <Icon name="delete" className={styles.buttonIcon} />
            Delete
          </button>
          <button
            className={`${styles.actionButton} ${styles.cancelButton}`}
            onClick={onCancelDelete}
          >
            <Icon name="close" className={styles.buttonIcon} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.videoSize}>
        {workout.videoSizeInMB.toFixed(1)} MB
      </div>

      <div className={styles.header}>
        <div className={styles.date}>{formatDateTime(workout.startTime)}</div>
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
          <div className={styles.statLabel}>Duration</div>
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
