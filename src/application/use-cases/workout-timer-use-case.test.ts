import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkoutTimerUseCase } from "./workout-timer-use-case";
import { eventBus } from "@/infrastructure/event-bus/event-bus";
import { WorkoutEntity } from "@/domain/entities/workout-entity";
import { WorkoutUpdatedEvent } from "@/domain/events/workout-events";

vi.mock("@/infrastructure/event-bus/event-bus");

describe("WorkoutTimerUseCase", () => {
  let useCase: WorkoutTimerUseCase;
  const mockEventBus = vi.mocked(eventBus);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useCase = new WorkoutTimerUseCase({
      eventBus: mockEventBus
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not emit events when workout not active", () => {
    // Given: idle workout (not started)
    const idleWorkout = new WorkoutEntity("workout-1");
    
    // When: timer is started with idle workout
    useCase.start(idleWorkout);
    vi.advanceTimersByTime(3000); // 3 seconds

    // Then: no events are emitted because workout is not active
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });

  it("emits event every second when active", () => {
    // Given: active workout
    const activeWorkout = new WorkoutEntity("workout-1");
    activeWorkout.start();

    // When: timer is started with active workout and time advances
    useCase.start(activeWorkout);
    vi.advanceTimersByTime(3000); // 3 seconds

    // Then: events are emitted every second
    expect(mockEventBus.publish).toHaveBeenCalledTimes(3);
    
    // Verify all calls are WorkoutUpdatedEvent
    mockEventBus.publish.mock.calls.forEach(call => {
      expect(call[0]).toBeInstanceOf(WorkoutUpdatedEvent);
    });
  });

  it("stops emitting when workout stops", () => {
    // Given: active workout that will be stopped
    const activeWorkout = new WorkoutEntity("workout-1");
    activeWorkout.start();

    // When: timer starts, runs for 2 seconds, workout stops, then runs 2 more seconds
    useCase.start(activeWorkout);
    vi.advanceTimersByTime(2000); // 2 seconds - should emit 2 events
    
    // Stop the workout
    activeWorkout.stop();
    vi.advanceTimersByTime(2000); // 2 more seconds - should not emit more events

    // Then: only the first 2 events were emitted (when workout was active)
    expect(mockEventBus.publish).toHaveBeenCalledTimes(2);
  });

  it("stop clears timer", () => {
    // Given: active workout and running timer
    const activeWorkout = new WorkoutEntity("workout-1");
    activeWorkout.start();

    useCase.start(activeWorkout);
    vi.advanceTimersByTime(1000); // 1 second
    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);

    // When: timer is manually stopped
    useCase.stop();
    
    // Clear the mock to count new calls
    mockEventBus.publish.mockClear();
    
    // Advance time after stopping
    vi.advanceTimersByTime(2000); // 2 more seconds

    // Then: no more events are emitted
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });

  it("handles multiple start calls", () => {
    // Given: active workout
    const activeWorkout = new WorkoutEntity("workout-1");
    activeWorkout.start();

    // When: start is called multiple times with same workout
    useCase.start(activeWorkout);
    useCase.start(activeWorkout);
    useCase.start(activeWorkout);
    
    // Advance time
    vi.advanceTimersByTime(2000); // 2 seconds

    // Then: events are emitted at normal rate (not multiplied by number of start calls)
    expect(mockEventBus.publish).toHaveBeenCalledTimes(2);
  });
});