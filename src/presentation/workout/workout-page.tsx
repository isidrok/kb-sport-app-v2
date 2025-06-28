import { useRef, useEffect } from "preact/hooks";
import styles from "./workout-page.module.css";
import { WorkoutControls } from "./components/workout-controls";
import { StatusPopup } from "../components/status-popup";
import { useModelLoading } from "../hooks/use-model-loading";
import { loadModelUseCase } from "@/application/use-cases/load-model-use-case";

/**
 * Main workout page with camera feed, pose detection, and real-time statistics.
 * Provides complete kettlebell tracking interface with glass styling.
 */
export function WorkoutPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { status, message } = useModelLoading();

  useEffect(() => {
    loadModelUseCase.execute().catch(() => {
      // Error is handled by the use case and published as event
    });
  }, []);

  const showStatusPopup = status === 'loading' || status === 'error';

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
      
      <WorkoutControls videoRef={videoRef} canvasRef={canvasRef} />
      
      <StatusPopup 
        visible={showStatusPopup}
        type={status === 'error' ? 'error' : 'loading'}
        message={message}
      />
    </div>
  );
}
