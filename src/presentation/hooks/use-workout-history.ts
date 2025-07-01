import { useState, useEffect } from 'preact/hooks';
import { workoutStorageService } from '@/application/services/workout-storage.service';
import { WorkoutSummary } from '@/domain/types/workout-storage.types';

export interface UseWorkoutHistoryReturn {
  workouts: WorkoutSummary[];
  isLoading: boolean;
  selectedWorkout: WorkoutSummary | null;
  viewWorkout: (workoutId: string) => Promise<void>;
  downloadWorkout: (workoutId: string) => Promise<void>;
  deleteWorkout: (workoutId: string) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
}

export function useWorkoutHistory(): UseWorkoutHistoryReturn {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSummary | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    setIsLoading(true);
    const storedWorkouts = await workoutStorageService.getStoredWorkouts();
    setWorkouts(storedWorkouts);
    setIsLoading(false);
  }

  async function viewWorkout(workoutId: string) {
    const videoBlob = await workoutStorageService.getWorkoutVideo(workoutId);
    const videoUrl = URL.createObjectURL(videoBlob);
    window.open(videoUrl, '_blank');
  }

  async function downloadWorkout(workoutId: string) {
    const videoBlob = await workoutStorageService.getWorkoutVideo(workoutId);
    const videoUrl = URL.createObjectURL(videoBlob);
    
    const now = new Date();
    const filename = `workout_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}.webm`;
    
    const anchor = document.createElement('a');
    anchor.href = videoUrl;
    anchor.download = filename;
    anchor.style.display = 'none';
    
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  function deleteWorkout(workoutId: string) {
    const workout = workouts.find(w => w.workoutId === workoutId);
    setSelectedWorkout(workout || null);
  }

  async function confirmDelete() {
    if (!selectedWorkout) return;
    
    await workoutStorageService.deleteWorkout(selectedWorkout.workoutId);
    setSelectedWorkout(null);
    await loadWorkouts();
  }

  function cancelDelete() {
    setSelectedWorkout(null);
  }

  return {
    workouts,
    isLoading,
    selectedWorkout,
    viewWorkout,
    downloadWorkout,
    deleteWorkout,
    confirmDelete,
    cancelDelete,
  };
}