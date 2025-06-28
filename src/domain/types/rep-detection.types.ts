/**
 * Domain types for pose detection and rep counting.
 * These types define the core data structures used in rep detection.
 */

export interface Prediction {
  box: [number, number, number, number]; // Bounding box coordinates [x1, y1, x2, y2]
  score: number; // Overall prediction confidence score
  keypoints: [number, number, number][]; // Array of [x, y, confidence] for each detected keypoint
}