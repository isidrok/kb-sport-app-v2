import { type Rep } from "../types/rep-detection.types";
import { WorkoutUpdatedEvent } from "../events/workout-events";

export enum WorkoutStatus {
  IDLE = "idle",
  ACTIVE = "active",
  STOPPED = "stopped",
}

export interface WorkoutStats {
  status: WorkoutStatus;
  startTime: Date | null;
  endTime: Date | null;
  isActive: boolean;
  repCount: number;
}

/**
 * Core business entity representing a workout session.
 *
 * A workout can be in one of three states:
 * - IDLE: Initial state, ready to start
 * - ACTIVE: Currently running with timestamps
 * - STOPPED: Completed with start and end times
 *
 * Business rules:
 * - Cannot start an already active workout
 * - Cannot stop a workout that is not active
 * - Start time is set when transitioning to ACTIVE
 * - End time is set when transitioning to STOPPED
 */
export class WorkoutEntity {
  private _status: WorkoutStatus = WorkoutStatus.IDLE;
  private _startTime: Date | null = null;
  private _endTime: Date | null = null;
  private _reps: Rep[] = [];

  constructor(private _id: string) {}

  get id(): string {
    return this._id;
  }

  get status(): WorkoutStatus {
    return this._status;
  }

  get startTime(): Date | null {
    return this._startTime;
  }

  get endTime(): Date | null {
    return this._endTime;
  }

  get reps(): Rep[] {
    return this._reps;
  }

  getRepCount(): number {
    return this._reps.length;
  }

  addRep(rep: Rep): WorkoutUpdatedEvent {
    this._reps.push(rep);
    return new WorkoutUpdatedEvent({
      workoutId: this._id,
      stats: this.getStats(),
    });
  }

  isActive(): boolean {
    return this._status === WorkoutStatus.ACTIVE;
  }

  start(): WorkoutUpdatedEvent {
    if (this._status === WorkoutStatus.ACTIVE) {
      throw new Error("Cannot start workout that is already active");
    }
    this._status = WorkoutStatus.ACTIVE;
    this._startTime = new Date();
    return new WorkoutUpdatedEvent({
      workoutId: this._id,
      stats: this.getStats(),
    });
  }

  stop(): WorkoutUpdatedEvent {
    if (this._status !== WorkoutStatus.ACTIVE) {
      throw new Error("Cannot stop workout that is not active");
    }
    this._status = WorkoutStatus.STOPPED;
    this._endTime = new Date();
    return new WorkoutUpdatedEvent({
      workoutId: this._id,
      stats: this.getStats(),
    });
  }

  getStats(): WorkoutStats {
    return {
      status: this._status,
      startTime: this._startTime,
      endTime: this._endTime,
      isActive: this.isActive(),
      repCount: this.getRepCount(),
    };
  }
}
