import { describe, it, expect } from "vitest";
import {
  WorkoutEntity,
  WorkoutStatus,
  type WorkoutStats,
} from "./workout-entity";
import { type Rep } from "../types/rep-detection.types";
import { WorkoutUpdatedEvent } from "../events/workout-events";

describe("WorkoutEntity", () => {
  it("creates workout with idle status", () => {
    const workout = new WorkoutEntity("workout-1");

    expect(workout.id).toBe("workout-1");
    expect(workout.status).toBe(WorkoutStatus.IDLE);
    expect(workout.startTime).toBeNull();
    expect(workout.endTime).toBeNull();
  });

  it("start workout sets active status and start time", () => {
    const workout = new WorkoutEntity("workout-1");
    const beforeStart = new Date();

    workout.start();

    const afterStart = new Date();
    expect(workout.status).toBe(WorkoutStatus.ACTIVE);
    expect(workout.startTime).not.toBeNull();
    expect(workout.startTime!.getTime()).toBeGreaterThanOrEqual(
      beforeStart.getTime()
    );
    expect(workout.startTime!.getTime()).toBeLessThanOrEqual(
      afterStart.getTime()
    );
  });

  it("stop workout sets stopped status and end time", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();
    const beforeStop = new Date();

    workout.stop();

    const afterStop = new Date();
    expect(workout.status).toBe(WorkoutStatus.STOPPED);
    expect(workout.endTime).not.toBeNull();
    expect(workout.endTime!.getTime()).toBeGreaterThanOrEqual(
      beforeStop.getTime()
    );
    expect(workout.endTime!.getTime()).toBeLessThanOrEqual(afterStop.getTime());
  });

  it("cannot start active workout", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();

    expect(() => workout.start()).toThrow(
      "Cannot start workout that is already active"
    );
  });

  it("cannot stop idle workout", () => {
    const workout = new WorkoutEntity("workout-1");

    expect(() => workout.stop()).toThrow(
      "Cannot stop workout that is not active"
    );
  });

  it("workout starts with empty reps", () => {
    const workout = new WorkoutEntity("workout-1");

    expect(workout.reps).toEqual([]);
    expect(workout.getRepCount()).toBe(0);
  });

  it("add rep increases count", () => {
    const workout = new WorkoutEntity("workout-1");
    const rep: Rep = { hand: "left", timestamp: new Date() };

    workout.addRep(rep);

    expect(workout.reps).toHaveLength(1);
    expect(workout.reps[0]).toEqual(rep);
    expect(workout.getRepCount()).toBe(1);
  });

  it("get rep count returns total", () => {
    const workout = new WorkoutEntity("workout-1");
    const rep1: Rep = { hand: "left", timestamp: new Date() };
    const rep2: Rep = { hand: "right", timestamp: new Date() };
    const rep3: Rep = { hand: "both", timestamp: new Date() };

    workout.addRep(rep1);
    workout.addRep(rep2);
    workout.addRep(rep3);

    expect(workout.getRepCount()).toBe(3);
    expect(workout.reps).toHaveLength(3);
  });

  it("isActive returns false when idle", () => {
    const workout = new WorkoutEntity("workout-1");
    expect(workout.isActive()).toBe(false);
  });

  it("isActive returns true when active", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();
    expect(workout.isActive()).toBe(true);
  });

  it("isActive returns false when stopped", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();
    workout.stop();
    expect(workout.isActive()).toBe(false);
  });

  it("getStats returns complete workout statistics", () => {
    const workout = new WorkoutEntity("workout-1");
    const rep: Rep = { hand: "left", timestamp: new Date() };
    workout.addRep(rep);

    const stats: WorkoutStats = workout.getStats();

    expect(stats.status).toBe(WorkoutStatus.IDLE);
    expect(stats.startTime).toBeNull();
    expect(stats.endTime).toBeNull();
    expect(stats.isActive).toBe(false);
    expect(stats.repCount).toBe(1);
  });

  it("getStats shows isActive true for active workout", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();

    const stats: WorkoutStats = workout.getStats();

    expect(stats.status).toBe(WorkoutStatus.ACTIVE);
    expect(stats.isActive).toBe(true);
  });

  it("getStats shows isActive false for stopped workout", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();
    workout.stop();

    const stats: WorkoutStats = workout.getStats();

    expect(stats.status).toBe(WorkoutStatus.STOPPED);
    expect(stats.isActive).toBe(false);
  });

  it("start method returns WorkoutUpdatedEvent with current stats", () => {
    const workout = new WorkoutEntity("workout-1");

    const event = workout.start();

    expect(event).toBeInstanceOf(WorkoutUpdatedEvent);
    expect(event.data.workoutId).toBe("workout-1");
    expect(event.data.stats.status).toBe(WorkoutStatus.ACTIVE);
    expect(event.data.stats.isActive).toBe(true);
  });

  it("stop method returns WorkoutUpdatedEvent with current stats", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();

    const event = workout.stop();

    expect(event).toBeInstanceOf(WorkoutUpdatedEvent);
    expect(event.data.workoutId).toBe("workout-1");
    expect(event.data.stats.status).toBe(WorkoutStatus.STOPPED);
    expect(event.data.stats.isActive).toBe(false);
  });

  it("addRep method returns WorkoutUpdatedEvent with updated stats", () => {
    const workout = new WorkoutEntity("workout-1");
    const rep: Rep = { hand: "left", timestamp: new Date() };

    const event = workout.addRep(rep);

    expect(event).toBeInstanceOf(WorkoutUpdatedEvent);
    expect(event.data.workoutId).toBe("workout-1");
    expect(event.data.stats.repCount).toBe(1);
  });

  it("getStats includes elapsed time zero when not started", () => {
    const workout = new WorkoutEntity("workout-1");

    const stats = workout.getStats();

    expect(stats.elapsedTime).toBe(0);
    expect(stats.formattedTime).toBe("00:00");
  });

  it("getStats includes elapsed time since start", async () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const stats = workout.getStats();

    expect(stats.elapsedTime).toBeGreaterThanOrEqual(90);
    expect(stats.elapsedTime).toBeLessThan(200);
  });

  it("getStats includes duration when stopped", async () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();

    await new Promise((resolve) => setTimeout(resolve, 100));
    workout.stop();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const stats = workout.getStats();

    expect(stats.elapsedTime).toBeGreaterThanOrEqual(90);
    expect(stats.elapsedTime).toBeLessThan(200);
  });

  it("getStats formats time correctly", () => {
    const workout = new WorkoutEntity("workout-1");
    
    // Mock the getElapsedTime method to test formatting
    const originalGetElapsedTime = workout["getElapsedTime"];
    
    // Test various time values
    workout["getElapsedTime"] = () => 0;
    expect(workout.getStats().formattedTime).toBe("00:00");
    
    workout["getElapsedTime"] = () => 45000; // 45 seconds
    expect(workout.getStats().formattedTime).toBe("00:45");
    
    workout["getElapsedTime"] = () => 65000; // 1 minute 5 seconds
    expect(workout.getStats().formattedTime).toBe("01:05");
    
    workout["getElapsedTime"] = () => 3599000; // 59 minutes 59 seconds
    expect(workout.getStats().formattedTime).toBe("59:59");
    
    // Restore original method
    workout["getElapsedTime"] = originalGetElapsedTime;
  });

  it("getStats formats time over hour correctly", () => {
    const workout = new WorkoutEntity("workout-1");
    
    // Mock the getElapsedTime method to test formatting
    const originalGetElapsedTime = workout["getElapsedTime"];
    
    // Test times over an hour
    workout["getElapsedTime"] = () => 3600000; // 60 minutes
    expect(workout.getStats().formattedTime).toBe("60:00");
    
    workout["getElapsedTime"] = () => 7260000; // 121 minutes (2h 1m)
    expect(workout.getStats().formattedTime).toBe("121:00");
    
    workout["getElapsedTime"] = () => 36000000; // 600 minutes (10 hours)
    expect(workout.getStats().formattedTime).toBe("600:00");
    
    // Restore original method
    workout["getElapsedTime"] = originalGetElapsedTime;
  });

  it("getStats includes zero rpm with no reps", () => {
    const workout = new WorkoutEntity("workout-1");
    
    const stats = workout.getStats();
    expect(stats.averageRPM).toBe(0);
    expect(stats.currentRPM).toBe(0);
    
    // Start workout and check again
    workout.start();
    const activeStats = workout.getStats();
    expect(activeStats.averageRPM).toBe(0);
    expect(activeStats.currentRPM).toBe(0);
  });

  it("getStats calculates average rpm from start", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();
    const startTime = new Date();
    
    // Add 6 reps over 30 seconds = 12 RPM
    const repTimes = [5000, 10000, 15000, 20000, 25000, 30000];
    
    // Mock Date.now() to control time
    const originalDateNow = Date.now;
    const baseTime = startTime.getTime();
    
    repTimes.forEach((timeOffset) => {
      Date.now = () => baseTime + timeOffset;
      workout.addRep({ hand: "both", timestamp: new Date(baseTime + timeOffset) });
    });
    
    // After 30 seconds with 6 reps
    Date.now = () => baseTime + 30000;
    const stats = workout.getStats();
    
    expect(stats.averageRPM).toBe(12); // 6 reps in 0.5 minutes = 12 RPM
    
    // Restore Date.now
    Date.now = originalDateNow;
  });

  it("getStats calculates current rpm from window", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();
    const startTime = new Date();
    
    // Mock Date.now() to control time
    const originalDateNow = Date.now;
    const baseTime = startTime.getTime();
    
    // Add 10 reps over 40 seconds with varying speeds
    // First 20 seconds: 2 reps (6 RPM)
    // Last 20 seconds: 8 reps (24 RPM)
    const repTimes = [
      5000, 15000,  // First 20 seconds: 2 reps
      22000, 24000, 26000, 28000, 30000, 32000, 34000, 36000  // Last 20 seconds: 8 reps
    ];
    
    repTimes.forEach((timeOffset) => {
      Date.now = () => baseTime + timeOffset;
      workout.addRep({ hand: "both", timestamp: new Date(baseTime + timeOffset) });
    });
    
    // After 40 seconds
    Date.now = () => baseTime + 40000;
    const stats = workout.getStats();
    
    expect(stats.currentRPM).toBe(24); // 8 reps in last 20 seconds = 24 RPM
    expect(stats.averageRPM).toBe(15); // 10 reps in 40 seconds = 15 RPM
    
    // Restore Date.now
    Date.now = originalDateNow;
  });

  it("getStats uses all reps when workout shorter than window", () => {
    const workout = new WorkoutEntity("workout-1");
    workout.start();
    const startTime = new Date();
    
    // Mock Date.now() to control time
    const originalDateNow = Date.now;
    const baseTime = startTime.getTime();
    
    // Add 6 reps over 10 seconds (36 RPM)
    const repTimes = [2000, 3000, 5000, 7000, 8000, 10000];
    
    repTimes.forEach((timeOffset) => {
      Date.now = () => baseTime + timeOffset;
      workout.addRep({ hand: "both", timestamp: new Date(baseTime + timeOffset) });
    });
    
    // After 10 seconds (shorter than 20-second window)
    Date.now = () => baseTime + 10000;
    const stats = workout.getStats();
    
    expect(stats.currentRPM).toBe(36); // 6 reps in 10 seconds = 36 RPM
    expect(stats.averageRPM).toBe(36); // Same as current since all reps are within window
    
    // Restore Date.now
    Date.now = originalDateNow;
  });

  it("getStats includes reps array", () => {
    const workout = new WorkoutEntity("workout-1");
    
    // Initially empty
    const initialStats = workout.getStats();
    expect(initialStats.reps).toEqual([]);
    
    // Add some reps
    const rep1: Rep = { hand: "left", timestamp: new Date() };
    const rep2: Rep = { hand: "right", timestamp: new Date() };
    const rep3: Rep = { hand: "both", timestamp: new Date() };
    
    workout.addRep(rep1);
    workout.addRep(rep2);
    workout.addRep(rep3);
    
    const stats = workout.getStats();
    expect(stats.reps).toEqual([rep1, rep2, rep3]);
    expect(stats.reps).toHaveLength(3);
  });
});
