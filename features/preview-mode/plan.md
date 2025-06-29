# Preview Mode Implementation Plan

## Architecture Overview

Preview mode allows users to test camera and pose detection without creating workout records. The implementation introduces a new PoseService that handles camera management, pose detection, and rendering. This service is then used by both PreviewService and the refactored WorkoutService.

Key architectural decisions:
- New PoseService encapsulates camera, detection, and rendering logic
- PreviewService uses PoseService for preview mode functionality
- WorkoutService refactored to use PoseService instead of direct camera/frame processing
- Independent state management for preview and workout modes
- Seamless transitions between modes as they share the same PoseService

## Phase 1: PoseService Creation

### Component: PoseService
**Purpose**: Centralized service for camera, pose detection, and rendering
**Stories Covered**: STORY-001, STORY-002, STORY-003

**Public API**:
```typescript
interface PoseService {
  startPoseDetection(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void>
  stopPoseDetection(canvasElement?: HTMLCanvasElement): void
  processFrame(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void
  isActive(): boolean
}
```

**Tests** (in order):
1. test_sets_element_dimensions_before_camera_start - Verifies dimensions are calculated and set
2. test_starts_camera_with_video_element - Verifies camera use case is called
3. test_stops_camera_and_clears_canvas - Verifies proper cleanup
4. test_delegates_frame_processing - Verifies processFrameUseCase is called
5. test_tracks_active_state - Verifies isActive returns correct state
6. test_handles_camera_start_errors - Verifies error propagation

### Component: Refactored WorkoutService
**Purpose**: Use PoseService instead of direct camera/frame management
**Stories Covered**: STORY-003

**Updated API**:
```typescript
// Remove setElementDimensions, camera operations, and processFrame
// Replace with poseService calls
```

**Tests** (in order):
1. test_delegates_pose_detection_to_pose_service - Verifies PoseService is used
2. test_maintains_workout_lifecycle - Verifies workout state management unchanged
3. test_stops_pose_detection_on_workout_stop - Verifies cleanup

## Phase 2: Preview Service Implementation

### Component: PreviewService
**Purpose**: Manages preview mode state and coordinates pose detection
**Stories Covered**: STORY-001, STORY-002

**Public API**:
```typescript
interface PreviewService {
  startPreview(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void>
  stopPreview(canvasElement?: HTMLCanvasElement): void
  isPreviewActive(): boolean
}
```

**Tests** (in order):
1. test_starts_pose_detection_without_workout - Verifies PoseService is called
2. test_publishes_preview_started_event - Verifies event is published
3. test_stops_pose_detection - Verifies cleanup
4. test_publishes_preview_stopped_event - Verifies event is published
5. test_tracks_preview_state - Verifies state management
6. test_handles_pose_service_errors - Verifies error handling

### Component: Preview Events
**Purpose**: Events for preview mode state changes
**Stories Covered**: STORY-001, STORY-002

**Events**:
```typescript
class PreviewStartedEvent extends Event<{ timestamp: string }>
class PreviewStoppedEvent extends Event<{ timestamp: string }>
```

**Tests** (in order):
1. test_preview_started_event_structure - Verifies event data
2. test_preview_stopped_event_structure - Verifies event data

## Phase 3: UI Components

### Component: usePreview Hook
**Purpose**: React hook for preview mode state and actions
**Stories Covered**: STORY-001, STORY-002, STORY-003

**Public API**:
```typescript
interface UsePreviewReturn {
  isPreviewActive: boolean
  startPreview: () => Promise<void>
  stopPreview: () => void
  error: string | null
}
```

**Tests** (in order):
1. test_initial_state_inactive - Verifies preview starts inactive
2. test_calls_preview_service_start - Verifies service integration
3. test_calls_preview_service_stop - Verifies service integration
4. test_updates_state_on_events - Verifies event subscription
5. test_handles_start_errors - Verifies error state
6. test_cleans_up_event_subscriptions - Verifies proper cleanup

### Component: PreviewButton
**Purpose**: Button component for preview mode control
**Stories Covered**: STORY-001, STORY-002, STORY-003, STORY-005

**Public API**:
```typescript
interface PreviewButtonProps {
  isPreviewActive: boolean
  isDisabled: boolean
  onStartPreview: () => void
  onStopPreview: () => void
}
```

**Tests** (in order):
1. test_renders_start_preview_text - Verifies initial state
2. test_renders_stop_preview_text_when_active - Verifies active state
3. test_applies_red_background_when_active - Verifies color change
4. test_calls_correct_handler_based_on_state - Verifies click handling
5. test_disabled_state_prevents_clicks - Verifies disabled behavior

### Component: WorkoutButton (Updated)
**Purpose**: Add red background when workout is active
**Stories Covered**: STORY-005

**Tests** (in order):
1. test_applies_red_background_when_active - Verifies consistent styling

### Component: WorkoutControls (Refactored)
**Purpose**: Container rendering both WorkoutButton and PreviewButton
**Stories Covered**: STORY-003, STORY-004, STORY-005

**Public API**:
```typescript
interface WorkoutControlsProps {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
}
```

**Tests** (in order):
1. test_renders_both_buttons - Verifies component structure
2. test_positions_buttons_side_by_side - Verifies layout
3. test_passes_refs_to_hooks - Verifies ref propagation
4. test_disables_preview_when_workout_active - Verifies mutual exclusivity
5. test_preview_enabled_after_workout_stops - Verifies re-enabling

## Phase 4: Frame Processing Integration

### Component: Updated useFrameProcessing Hook
**Purpose**: Support frame processing for both workout and preview modes
**Stories Covered**: STORY-001

**Changes**:
- Check for either workout or preview active state
- Use PoseService for frame processing

**Tests** (in order):
1. test_processes_frames_during_preview - Verifies preview mode support
2. test_processes_frames_during_workout - Verifies workout mode still works
3. test_stops_processing_when_both_inactive - Verifies cleanup

## Integration Points

- **PoseService** is used by both WorkoutService and PreviewService
- **PreviewService** coordinates with PoseService for camera and detection
- **WorkoutService** delegates pose-related operations to PoseService
- **usePreview** hook integrates with PreviewService
- **WorkoutControls** uses both useWorkoutState and usePreview hooks
- **useFrameProcessing** checks both workout and preview states

## Risk Mitigation

- **Shared resource conflicts**: PoseService ensures only one mode uses camera
- **State synchronization**: Independent services prevent coupling
- **Seamless transitions**: Shared PoseService enables smooth mode switches
- **Frame processing continuity**: Same pipeline for both modes
- **Error handling**: Consistent error propagation through service layers