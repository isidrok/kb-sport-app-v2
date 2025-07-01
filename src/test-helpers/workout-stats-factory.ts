import {
  WorkoutStatus,
  type WorkoutStats,
} from "@/domain/entities/workout-entity";
import { type Rep } from "@/domain/types/rep-detection.types";

/**
 * Creates a complete WorkoutStats object with default values for testing.
 * This ensures all tests provide complete WorkoutStats objects and prevents
 * TypeScript errors when the interface is extended with new fields.
 */
export function createMockWorkoutStats(
  overrides: Partial<WorkoutStats> = {}
): WorkoutStats {
  return {
    status: WorkoutStatus.IDLE,
    startTime: null,
    endTime: null,
    isActive: false,
    repCount: 0,
    elapsedTime: 0,
    formattedTime: "00:00",
    averageRPM: 0,
    currentRPM: 0,
    reps: [],
    ...overrides,
  };
}

/**
 * Helper function to create a mock Rep object for testing.
 */
export function createMockRep(overrides: Partial<Rep> = {}): Rep {
  return {
    hand: "both",
    timestamp: new Date(),
    ...overrides,
  };
}