import { describe, it, expect, vi, beforeEach } from "vitest";
import { DetectRepUseCase } from "./detect-rep-use-case";
import { repDetectionService } from "@/domain/services/rep-detection.service";
import { eventBus } from "@/infrastructure/event-bus/event-bus";
import { WorkoutEntity } from "@/domain/entities/workout-entity";
import { WorkoutUpdatedEvent } from "@/domain/events/workout-events";
import { type Prediction, type Rep } from "@/domain/types/rep-detection.types";

vi.mock("@/domain/services/rep-detection.service");
vi.mock("@/infrastructure/event-bus/event-bus");

describe("DetectRepUseCase", () => {
  let useCase: DetectRepUseCase;
  const mockRepDetectionService = vi.mocked(repDetectionService);
  const mockEventBus = vi.mocked(eventBus);
  let workout: WorkoutEntity;
  let prediction: Prediction;

  beforeEach(() => {
    vi.clearAllMocks();

    useCase = new DetectRepUseCase({
      repDetectionService: repDetectionService,
      eventBus: eventBus,
    });

    workout = new WorkoutEntity("workout-1");
    prediction = {
      box: [0, 0, 100, 100],
      score: 0.8,
      keypoints: [
        [50, 50, 0.9],
        [30, 70, 0.8],
        [70, 70, 0.8],
      ],
    };
  });

  it("calls rep detection service", () => {
    mockRepDetectionService.detectRep.mockReturnValue(null);

    useCase.execute({
      prediction,
      workout,
    });

    expect(mockRepDetectionService.detectRep).toHaveBeenCalledWith(prediction);
  });

  it("adds rep to workout when detected", () => {
    const rep: Rep = {
      hand: "both",
      timestamp: new Date(),
    };
    mockRepDetectionService.detectRep.mockReturnValue(rep);

    expect(workout.getRepCount()).toBe(0);

    useCase.execute({
      prediction,
      workout,
    });

    expect(workout.getRepCount()).toBe(1);
    expect(workout.reps[0]).toEqual(rep);
  });

  it("emits workout status event on rep add", () => {
    const rep: Rep = {
      hand: "left",
      timestamp: new Date(),
    };
    mockRepDetectionService.detectRep.mockReturnValue(rep);

    useCase.execute({
      prediction,
      workout,
    });

    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);

    const call = mockEventBus.publish.mock.calls[0];
    const event = call[0];

    expect(event).toBeInstanceOf(WorkoutUpdatedEvent);
    expect(event.data.workoutId).toBe("workout-1");
    expect(event.data.stats.status).toBe("idle");
  });

  it("returns updated rep count", () => {
    const rep: Rep = {
      hand: "right",
      timestamp: new Date(),
    };
    mockRepDetectionService.detectRep.mockReturnValue(rep);

    const result = useCase.execute({
      prediction,
      workout,
    });

    expect(result.repDetected).toBe(true);
    expect(result.totalReps).toBe(1);
  });

  it("returns false when no rep detected", () => {
    mockRepDetectionService.detectRep.mockReturnValue(null);

    const result = useCase.execute({
      prediction,
      workout,
    });

    expect(result.repDetected).toBe(false);
    expect(result.totalReps).toBe(0);
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });
});
