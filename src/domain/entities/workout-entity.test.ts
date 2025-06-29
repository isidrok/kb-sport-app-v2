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
});
