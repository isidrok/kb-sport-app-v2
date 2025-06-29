# Domain Concepts

## Glossary

- **Workout**: A kettlebell exercise session with defined start/end times and status tracking
- **Preview Mode**: Testing mode for pose detection without creating workout records
- **Pose Detection**: Computer vision analysis of user body position using keypoints
- **YOLOv8**: Object detection model adapted for pose estimation
- **Keypoints**: Specific body joints tracked by the ML model (17 points: nose, eyes, ears, shoulders, elbows, wrists, hips, knees, ankles)
- **Rep**: Single repetition of a kettlebell exercise (future feature)
- **Session**: Complete workout from start to stop with tracked exercises
- **PoseService**: Shared infrastructure for camera operations and pose detection

## Business Rules

### Workout Lifecycle
1. **Workout Creation**: New workout starts in `idle` status with unique GUID
2. **Workout Start**: Can only start workout when status is `idle`
   - Sets status to `active`
   - Records start time
   - Cannot start already active workout
3. **Workout Stop**: Can only stop workout when status is `active`
   - Sets status to `stopped` 
   - Records end time
   - Cannot stop idle workout

### Preview Mode Rules
1. **Preview Purpose**: Allows users to test camera and pose detection setup
2. **No Workout Creation**: Preview mode never creates workout records
3. **Mutual Exclusivity**: Preview mode and workout mode cannot run simultaneously
4. **State Management**: Independent preview state tracking (active/inactive)
5. **Event Publishing**: PreviewStartedEvent and PreviewStoppedEvent for UI coordination

### Camera Requirements
- Camera access required for pose detection
- Video/canvas dimensions must match client rectangle  
- PoseService handles camera lifecycle for both modes
- Proper resource cleanup on stop
- Canvas clearing uses renderer adapter, not direct context manipulation

### Model Loading
- ML model must preload before workout can start
- Model loading independent of workout lifecycle
- Model status affects UI button availability

## Domain Model

### Workout Entity
```typescript
class Workout {
  private _id: string           // Unique identifier (GUID)
  private _status: WorkoutStatus // Current state
  private _startTime: Date | null // When workout began
  private _endTime: Date | null   // When workout ended
}

enum WorkoutStatus {
  IDLE = 'idle',       // Not started
  ACTIVE = 'active',   // In progress  
  STOPPED = 'stopped'  // Completed
}
```

### Workout Statistics
```typescript
interface WorkoutStats {
  status: WorkoutStatus
  startTime: Date | null
  endTime: Date | null
  canStart: boolean    // Derived: status === 'idle'
  canStop: boolean     // Derived: status === 'active'
}
```

### State Transitions
```
idle ──start()──> active ──stop()──> stopped
 ↑                   ↓
 └─── [invalid] ─────┘
```

### Pose Detection Data
```typescript
interface Prediction {
  box: [number, number, number, number]  // Bounding box [x1, y1, x2, y2]
  score: number                          // Confidence score 0-1
  keypoints: [number, number, number][]  // [x, y, confidence] for each joint
}
```

## Future Domain Concepts

### Rep Detection (Planned)
- **Rep**: Single exercise repetition with start/end pose
- **Exercise Type**: Kettlebell swing, clean, snatch, etc.
- **Rep Quality**: Form analysis and scoring
- **Set**: Collection of reps for specific exercise

### Workout Programs (Planned)  
- **Program**: Structured workout plan
- **Exercise**: Specific movement with target reps/sets
- **Progress Tracking**: Historical performance data

## Domain Invariants

1. **Workout State Consistency**: Workout can only transition through valid states
2. **Time Ordering**: Start time must be before end time
3. **Resource Management**: Camera must be stopped when workout stops
4. **Model Dependency**: Pose detection requires loaded ML model
5. **Dimension Integrity**: Video/canvas dimensions must match for proper rendering

## Integration Boundaries

- **Camera System**: Provides video stream, independent of workout
- **ML Model**: Processes frames, provides pose predictions  
- **Rendering System**: Visualizes poses on canvas overlay
- **Event System**: Async communication between layers