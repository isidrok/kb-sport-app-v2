/**
 * Domain types for workout storage and metadata.
 * These types define the core data structures used for persisting workout data.
 */

/**
 * Represents the metadata for a stored workout session.
 * This is the format used for persisting workout data to storage.
 */
export interface WorkoutMetadata {
  workoutId: string;
  startTime: string; // ISO string format
  endTime: string; // ISO string format
  duration: number; // Duration in milliseconds
  totalReps: number;
  rpm: number; // Average RPM for the workout
  reps: Array<{
    timestamp: number; // Unix timestamp in milliseconds
    hand: 'left' | 'right' | 'both'; // Which hand performed the rep
  }>;
  videoSize: number; // Video file size in bytes
}

/**
 * Represents a summary view of a stored workout for display purposes.
 * This is the format used by the presentation layer for workout lists.
 */
export interface WorkoutSummary {
  workoutId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // Duration in milliseconds
  totalReps: number;
  rpm: number;
  videoSizeInMB: number; // Converted to MB for display
}