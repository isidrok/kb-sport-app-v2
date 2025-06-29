import { describe, it, expect, vi, beforeEach } from "vitest";
import { RepDetectionService } from "./rep-detection.service";
import { type RepDetectionStateMachine } from "./rep-detection-state-machine";
import { type Prediction } from "../types/rep-detection.types";

describe("RepDetectionService", () => {
  let service: RepDetectionService;
  let mockStateMachine: Partial<RepDetectionStateMachine>;

  beforeEach(() => {
    mockStateMachine = {
      processKeyPoints: vi.fn(),
      getCurrentState: vi.fn(),
      reset: vi.fn(),
    };

    service = new RepDetectionService({
      stateMachine: mockStateMachine as RepDetectionStateMachine,
    });
  });

  it("returns null when no rep detected", () => {
    const prediction: Prediction = {
      box: [0, 0, 100, 100],
      score: 0.8,
      keypoints: [
        [50, 100, 0.7], // nose
        [30, 200, 0.8], // left wrist
        [70, 210, 0.9], // right wrist
      ],
    };

    (mockStateMachine.processKeyPoints as any).mockReturnValue({
      repDetected: false,
    });

    const result = service.detectRep(prediction);

    expect(result).toBeNull();
  });

  it("returns rep when detected", () => {
    const prediction: Prediction = {
      box: [0, 0, 100, 100],
      score: 0.8,
      keypoints: [
        [50, 100, 0.7], // nose
        [30, 200, 0.8], // left wrist
        [70, 210, 0.9], // right wrist
      ],
    };

    (mockStateMachine.processKeyPoints as any).mockReturnValue({
      repDetected: true,
      hand: "left",
    });

    const result = service.detectRep(prediction);

    expect(result).not.toBeNull();
    expect(result!.hand).toBe("left");
    expect(result!.timestamp).toBeInstanceOf(Date);
  });

  it("extracts key points from prediction", () => {
    const prediction: Prediction = {
      box: [0, 0, 100, 100],
      score: 0.8,
      keypoints: Array(17).fill([0, 0, 0]), // YOLOv8 has 17 keypoints
    };

    // Set specific keypoints: nose=0, left_wrist=9, right_wrist=10
    prediction.keypoints[0] = [50, 100, 0.7]; // nose
    prediction.keypoints[9] = [30, 200, 0.8]; // left wrist
    prediction.keypoints[10] = [70, 210, 0.9]; // right wrist
    (mockStateMachine.processKeyPoints as any).mockReturnValue({
      repDetected: false,
    });

    service.detectRep(prediction);

    expect(mockStateMachine.processKeyPoints).toHaveBeenCalledWith({
      noseY: 100,
      leftWristY: 200,
      rightWristY: 210,
      leftWristConfidence: 0.8,
      rightWristConfidence: 0.9,
      noseConfidence: 0.7,
    });
  });

  it("handles missing key points", () => {
    const prediction: Prediction = {
      box: [0, 0, 100, 100],
      score: 0.8,
      keypoints: [], // No keypoints
    };

    const result = service.detectRep(prediction);

    expect(result).toBeNull();
    expect(mockStateMachine.processKeyPoints).not.toHaveBeenCalled();
  });

  it("reset clears state machine", () => {
    service.reset();

    expect(mockStateMachine.reset).toHaveBeenCalled();
  });
});
