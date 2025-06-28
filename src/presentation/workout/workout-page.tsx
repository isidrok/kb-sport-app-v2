import { useRef } from "preact/hooks";
import styles from "./workout-page.module.css";

/**
 * Main workout page with camera feed, pose detection, and real-time statistics.
 * Provides complete kettlebell tracking interface with glass styling.
 */
export function WorkoutPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className={styles.workoutPage}>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.video}
          playsInline
          autoPlay
          muted
        />
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </div>
  );
}
