import { type Rep } from "../types/rep-detection.types";
import { type Prediction } from "../types/rep-detection.types";
import { RepDetectionStateMachine } from "./rep-detection-state-machine";

export interface RepDetectionServiceDependencies {
  stateMachine: RepDetectionStateMachine;
}

export class RepDetectionService {
  constructor(private dependencies: RepDetectionServiceDependencies) {}

  detectRep(prediction: Prediction): Rep | null {
    // Extract keypoints from prediction (YOLOv8 format)
    const keypoints = prediction.keypoints;
    if (!keypoints || keypoints.length < 3) {
      return null;
    }

    // Map YOLOv8 keypoints: [nose=0, left_wrist=9, right_wrist=10]
    const nose = keypoints[0];
    const leftWrist = keypoints[9] || [0, 0, 0];
    const rightWrist = keypoints[10] || [0, 0, 0];

    const repKeyPoints = {
      noseY: nose[1],
      leftWristY: leftWrist[1],
      rightWristY: rightWrist[1],
      leftWristConfidence: leftWrist[2],
      rightWristConfidence: rightWrist[2],
      noseConfidence: nose[2],
    };

    const result =
      this.dependencies.stateMachine.processKeyPoints(repKeyPoints);

    if (!result.repDetected) {
      return null;
    }

    return {
      hand: result.hand!,
      timestamp: new Date(),
    };
  }

  reset(): void {
    this.dependencies.stateMachine.reset();
  }
}

// Singleton instance
export const repDetectionService = new RepDetectionService({
  stateMachine: new RepDetectionStateMachine(),
});
