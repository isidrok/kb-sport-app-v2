# Workout Controls Implementation Plan

## Architecture Overview

Following DDD with clean architecture layers:
- **Domain**: Workout entity with business rules
- **Application**: Use cases and services coordinating business operations  
- **Infrastructure**: EventBus, camera/prediction/rendering adapters
- **Presentation**: Hooks and components for UI concerns

## Phase 1: Core Domain & Infrastructure

### Component: Workout Domain Entity
**Purpose**: Core business entity representing a workout session
**Stories Covered**: Foundation for all stories

**Public API**:
```typescript
class Workout {
  constructor(id: string)
  get id(): string
  get status(): WorkoutStatus
  get startTime(): Date | null
  get endTime(): Date | null
  start(): void
  stop(): void
}

enum WorkoutStatus {
  IDLE = 'idle',
  ACTIVE = 'active', 
  STOPPED = 'stopped'
}
```

**Tests** (in order):
1. test_create_workout_with_idle_status - Creates workout in idle state
2. test_start_workout_sets_active_status_and_start_time - Starting sets status and timestamp
3. test_stop_workout_sets_stopped_status_and_end_time - Stopping sets status and timestamp
4. test_cannot_start_active_workout - Throws error when starting already active workout
5. test_cannot_stop_idle_workout - Throws error when stopping idle workout

### Component: EventBus Infrastructure
**Purpose**: Lightweight event system for async communication
**Stories Covered**: Foundation for all async feedback

**Public API**:
```typescript
// Base event class
abstract class Event<T = any> {
  constructor(public readonly data: T) {}
}

// Specific event classes
class ModelLoadingEvent extends Event<{status: 'loading' | 'ready' | 'error', message?: string}> {}
class CameraAccessEvent extends Event<{status: 'requesting' | 'ready' | 'error', message?: string}> {}
class WorkoutStatusEvent extends Event<{workoutId: string, status: WorkoutStatus}> {}

// EventBus
class EventBus {
  subscribe<T>(eventType: string, listener: (event: T) => void): () => void
  publish<T>(eventType: string, event: T): void
}

// Singleton export
export const eventBus: EventBus
```

**Tests** (in order):
1. test_subscribe_returns_unsubscribe_function - Subscribe returns cleanup function
2. test_publish_calls_registered_listeners - Basic publish/subscribe functionality
3. test_unsubscribe_removes_listener - Cleanup works correctly
4. test_multiple_listeners_called - Multiple subscribers work
5. test_event_classes_store_data - Event classes hold data properly

### Component: useEventBus Hook
**Purpose**: Easy event subscription/publishing from components
**Stories Covered**: Foundation for UI event handling

**Public API**:
```typescript
function useEventBus<T>(eventType: string): {
  publish: (event: T) => void
  subscribe: (listener: (event: T) => void) => void
}
```

**Tests** (in order):
1. test_returns_publish_and_subscribe_functions - Returns correct interface
2. test_publish_calls_eventbus - Delegates to eventBus.publish
3. test_subscribe_adds_listener_and_cleans_up - Manages listeners with cleanup

## Phase 2: Application Layer Use Cases

### Component: LoadModelUseCase
**Purpose**: Preload ML model with status feedback
**Stories Covered**: STORY-001

**Public API**:
```typescript
class LoadModelUseCase {
  constructor(predictionAdapter: PredictionAdapter, eventBus: EventBus)
  execute(): Promise<void>
}
```

**Tests** (in order):
1. test_publishes_loading_event_on_start - Publishes ModelLoadingEvent with loading status
2. test_publishes_ready_event_on_success - Publishes ready when model loads
3. test_publishes_error_event_on_failure - Publishes error on model load failure
4. test_initializes_prediction_adapter - Calls predictionAdapter.initialize()

### Component: StartCameraUseCase
**Purpose**: Start camera feed
**Stories Covered**: STORY-002 (camera portion)

**Public API**:
```typescript
class StartCameraUseCase {
  constructor(cameraAdapter: CameraAdapter, eventBus: EventBus)
  execute(videoElement: HTMLVideoElement): Promise<void>
}
```

**Tests** (in order):
1. test_publishes_requesting_camera_event - Publishes CameraAccessEvent requesting
2. test_starts_camera_and_publishes_ready - Starts camera and publishes ready event
3. test_publishes_error_on_access_denied - Handles camera permission errors

### Component: StopCameraUseCase
**Purpose**: Stop camera and cleanup resources
**Stories Covered**: STORY-003 (camera portion)

**Public API**:
```typescript
class StopCameraUseCase {
  constructor(cameraAdapter: CameraAdapter)
  execute(): void
}
```

**Tests** (in order):
1. test_stops_camera_adapter - Calls cameraAdapter.stop()
2. test_handles_camera_already_stopped - No-op if camera not active

### Component: StartWorkoutUseCase
**Purpose**: Start workout session
**Stories Covered**: STORY-002 (workout portion)

**Public API**:
```typescript
class StartWorkoutUseCase {
  constructor(eventBus: EventBus)
  execute(workout: Workout): void
}
```

**Tests** (in order):
1. test_throws_if_workout_not_idle - Rejects non-idle workout
2. test_starts_workout_and_publishes_event - Starts workout and publishes WorkoutStatusEvent
3. test_sets_workout_start_time - Sets workout start time

### Component: StopWorkoutUseCase
**Purpose**: Stop workout session
**Stories Covered**: STORY-003 (workout portion)

**Public API**:
```typescript
class StopWorkoutUseCase {
  constructor(eventBus: EventBus)
  execute(workout: Workout): void
}
```

**Tests** (in order):
1. test_throws_if_workout_not_active - Rejects non-active workout
2. test_stops_workout_and_publishes_event - Stops workout and publishes WorkoutStatusEvent
3. test_sets_workout_end_time - Sets workout end time

### Component: ProcessFrameUseCase  
**Purpose**: Process single frame for pose detection
**Stories Covered**: STORY-002 (pose analysis)

**Public API**:
```typescript
class ProcessFrameUseCase {
  constructor(
    predictionAdapter: PredictionAdapter,
    rendererAdapter: PredictionRendererAdapter
  )
  execute(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void
}
```

**Tests** (in order):
1. test_processes_frame_when_model_ready - Calls prediction adapter
2. test_renders_poses_to_canvas - Calls renderer with predictions
3. test_skips_processing_when_model_not_ready - No-op if model not initialized

### Component: GetWorkoutStatusUseCase
**Purpose**: Query current workout status
**Stories Covered**: All (UI state queries)

**Public API**:
```typescript
interface WorkoutStats {
  status: WorkoutStatus
  startTime: Date | null
  endTime: Date | null
  canStart: boolean
  canStop: boolean
}

class GetWorkoutStatusUseCase {
  execute(workout: Workout): WorkoutStats
}
```

**Tests** (in order):
1. test_returns_workout_stats - Returns all workout properties in WorkoutStats
2. test_can_start_when_idle - canStart true for idle workout
3. test_can_stop_when_active - canStop true for active workout

## Phase 3: Application Service & Coordination

### Component: WorkoutService
**Purpose**: Coordinate use cases and maintain workout instance
**Stories Covered**: All stories

**Public API**:
```typescript
class WorkoutService {
  constructor(
    startCameraUseCase: StartCameraUseCase,
    stopCameraUseCase: StopCameraUseCase,
    startWorkoutUseCase: StartWorkoutUseCase,
    stopWorkoutUseCase: StopWorkoutUseCase,
    processFrameUseCase: ProcessFrameUseCase,
    getWorkoutStatusUseCase: GetWorkoutStatusUseCase
  )
  get currentWorkout(): Workout
  startWorkout(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void>
  stopWorkout(): void
  processFrame(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void
  getWorkoutStatus(): WorkoutStats
}
```

**Tests** (in order):
1. test_creates_workout_on_initialization - Has workout instance
2. test_sets_video_canvas_dimensions_from_client_rect - Sets width/height from getBoundingClientRect before starting camera
3. test_start_workout_calls_camera_and_workout_use_cases - Calls both camera and workout use cases
4. test_stop_workout_calls_camera_and_workout_use_cases - Calls both camera and workout use cases
5. test_delegates_process_frame_to_use_case - Calls ProcessFrameUseCase
6. test_returns_workout_stats - Returns current workout stats

## Phase 4: Presentation Layer

### Component: useModelLoading Hook
**Purpose**: Subscribe to model loading events
**Stories Covered**: STORY-001

**Public API**:
```typescript
function useModelLoading(): {
  status: 'loading' | 'ready' | 'error'
  message?: string
}
```

**Tests** (in order):
1. test_returns_loading_initially - Default loading state
2. test_updates_on_model_events - Updates when ModelLoadingEvent published
3. test_cleans_up_listeners - Removes listeners on unmount

### Component: useWorkoutState Hook
**Purpose**: Subscribe to workout state changes
**Stories Covered**: STORY-002, STORY-003

**Public API**:
```typescript
function useWorkoutState(): {
  status: WorkoutStatus
  canStart: boolean
  canStop: boolean
  startTime: Date | null
  endTime: Date | null
}
```

**Tests** (in order):
1. test_returns_current_workout_stats - Gets stats from WorkoutService
2. test_updates_on_workout_events - Updates when WorkoutStatusEvent published
3. test_cleans_up_listeners - Removes listeners on unmount

### Component: useWorkoutActions Hook
**Purpose**: Workout action commands with loading states
**Stories Covered**: STORY-002, STORY-003

**Public API**:
```typescript
function useWorkoutActions(): {
  isStarting: boolean
  startWorkout: (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => Promise<void>
  stopWorkout: () => void
  cameraError?: string
}
```

**Tests** (in order):
1. test_start_workout_calls_service - Delegates to WorkoutService
2. test_stop_workout_calls_service - Delegates to WorkoutService
3. test_tracks_camera_errors - Shows camera permission errors from events
4. test_tracks_starting_state - isStarting true during start operation

### Component: WorkoutControlsComponent
**Purpose**: Floating start/stop button
**Stories Covered**: STORY-002, STORY-003, STORY-004

**Public API**:
```typescript
interface WorkoutControlsProps {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
}

function WorkoutControls(props: WorkoutControlsProps): JSX.Element
```

**Tests** (in order):
1. test_shows_start_when_can_start - Displays "Start" button
2. test_shows_stop_when_active - Displays "Stop" button  
3. test_disabled_when_starting - Button disabled during start
4. test_calls_start_with_refs - Calls startWorkout with video and canvas elements
5. test_calls_stop_on_click - Calls stopWorkout when clicked

### Component: StatusPopup
**Purpose**: Show loading and error messages
**Stories Covered**: STORY-001, STORY-002

**Public API**:
```typescript
interface StatusPopupProps {
  message?: string
  type: 'loading' | 'error'
  visible: boolean
}

function StatusPopup(props: StatusPopupProps): JSX.Element
```

**Tests** (in order):
1. test_shows_when_visible - Displays popup when visible
2. test_hides_when_not_visible - Hides popup when not visible
3. test_displays_message - Shows provided message
4. test_handles_loading_and_error_types - Different rendering for types

## Integration Points
- **LoadModelUseCase** publishes to **EventBus** → **useModelLoading** hook subscribes
- **StartCameraUseCase** publishes to **EventBus** → **useWorkoutActions** hook subscribes  
- **WorkoutService** holds Workout entity → **useWorkoutState** queries stats
- **WorkoutControls** uses **useWorkoutActions** and **useWorkoutState** hooks
- **App component** calls **LoadModelUseCase** on mount
- **WorkoutPage** manages requestAnimationFrame → **WorkoutService.processFrame**

## Risk Mitigation
- **Model loading failure**: LoadModelUseCase publishes error events, UI shows permanent error
- **Camera permission denial**: StartCameraUseCase publishes error events, UI shows fix instructions
- **Rapid button clicks**: useWorkoutActions tracks isStarting state, disables button
- **Buffer corruption**: StartCameraUseCase sets video/canvas dimensions before camera start
- **Memory leaks**: All hooks clean up event listeners on unmount