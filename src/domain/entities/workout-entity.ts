import { type Rep } from '../types/rep-detection.types'

export enum WorkoutStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  STOPPED = 'stopped'
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
  private _status: WorkoutStatus = WorkoutStatus.IDLE
  private _startTime: Date | null = null
  private _endTime: Date | null = null
  private _reps: Rep[] = []

  constructor(private _id: string) {}

  get id(): string {
    return this._id
  }

  get status(): WorkoutStatus {
    return this._status
  }

  get startTime(): Date | null {
    return this._startTime
  }

  get endTime(): Date | null {
    return this._endTime
  }

  get reps(): Rep[] {
    return this._reps
  }

  getRepCount(): number {
    return this._reps.length
  }

  addRep(rep: Rep): void {
    this._reps.push(rep)
  }

  start(): void {
    if (this._status === WorkoutStatus.ACTIVE) {
      throw new Error('Cannot start workout that is already active')
    }
    this._status = WorkoutStatus.ACTIVE
    this._startTime = new Date()
  }

  stop(): void {
    if (this._status !== WorkoutStatus.ACTIVE) {
      throw new Error('Cannot stop workout that is not active')
    }
    this._status = WorkoutStatus.STOPPED
    this._endTime = new Date()
  }
}