import { RefObject } from "preact";
import { useState } from "preact/hooks";
import { useWorkoutState } from "../hooks/use-workout-state";
import { useWorkoutActions } from "../hooks/use-workout-actions";
import { usePreview } from "../../hooks/use-preview";
import { WorkoutButton } from "./workout-button";
import { PreviewButton } from "./preview-button";
import { WorkoutHistoryButton } from "../../workout-history/components/workout-history-button";
import { WorkoutHistoryDrawer } from "../../workout-history/components/workout-history-drawer";
import styles from "./workout-controls.module.css";

interface WorkoutControlsProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
}

export function WorkoutControls({ videoRef, canvasRef }: WorkoutControlsProps) {
  const stats = useWorkoutState();
  const { startWorkout, stopWorkout, isStarting } = useWorkoutActions();
  const { isPreviewActive, startPreview, stopPreview } = usePreview(
    videoRef,
    canvasRef
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const canStart = !stats.isActive;
  const canStop = stats.isActive;

  const handleStartWorkout = async () => {
    if (videoRef.current && canvasRef.current) {
      await startWorkout(videoRef.current, canvasRef.current);
    }
  };

  const handleStopWorkout = () => {
    if (canvasRef.current) {
      stopWorkout(canvasRef.current);
    }
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
  };

  const handleCloseHistory = () => {
    setIsHistoryOpen(false);
  };

  return (
    <>
      <div className={styles.container}>
        <WorkoutButton
          canStart={canStart}
          canStop={canStop}
          isStarting={isStarting}
          onStartWorkout={handleStartWorkout}
          onStopWorkout={handleStopWorkout}
        />
        <WorkoutHistoryButton onClick={handleOpenHistory} />
        <PreviewButton
          isPreviewActive={isPreviewActive}
          isDisabled={canStop}
          onStartPreview={startPreview}
          onStopPreview={stopPreview}
        />
      </div>
      <WorkoutHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={handleCloseHistory}
      />
    </>
  );
}
