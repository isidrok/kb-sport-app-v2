import { describe, it, expect, vi, beforeEach } from "vitest";
import { StartWorkoutUseCase } from "./start-workout-use-case";
import { WorkoutUpdatedEvent } from "@/domain/events/workout-events";
import { eventBus } from "@/infrastructure/event-bus/event-bus";
import { WorkoutEntity } from "@/domain/entities/workout-entity";

vi.mock("@/infrastructure/event-bus/event-bus");

describe("StartWorkoutUseCase", () => {
  let useCase: StartWorkoutUseCase;
  const mockEventBus = vi.mocked(eventBus);
  let idleWorkout: WorkoutEntity;
  let activeWorkout: WorkoutEntity;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new StartWorkoutUseCase(eventBus);

    idleWorkout = new WorkoutEntity("workout-1");
    activeWorkout = new WorkoutEntity("workout-2");
    activeWorkout.start();
  });

  it("publishes event returned from workout.start()", () => {
    useCase.execute(idleWorkout);

    expect(idleWorkout.status).toBe("active");
    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);

    const call = mockEventBus.publish.mock.calls[0];
    const event = call[0];

    expect(event).toBeInstanceOf(WorkoutUpdatedEvent);
    expect(event.data.workoutId).toBe("workout-1");
    expect(event.data.stats.status).toBe("active");
    expect(event.data.stats.isActive).toBe(true);
  });
});
