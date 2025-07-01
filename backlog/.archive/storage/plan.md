# Storage Implementation Plan

## Architecture Overview

The storage feature will use OPFS (Origin Private File System) for storing workout videos and metadata. The architecture follows the clean architecture pattern with:
- **Infrastructure Layer**: OPFS adapter for file operations
- **Application Layer**: WorkoutStorageService coordinating storage operations
- **Presentation Layer**: Drawer component with workout history cards

Key design decisions:
- Stream video directly to OPFS without memory buffering
- PoseService returns MediaStream from camera
- WorkoutService coordinates with WorkoutStorageService for recording
- Storage check only at app load
- Configurable video quality (not exposed in UI)
- Side drawer for workout history display

## Phase 1: Core Storage Infrastructure

### Component: OPFSAdapter
**Purpose**: Low-level file operations for OPFS access
**Stories Covered**: STORY-001, STORY-002

**Public API**:
```typescript
interface OPFSAdapter {
  checkStorageAvailable(): Promise<{ available: boolean; spaceInMB: number }>
  createWorkoutDirectory(workoutId: string): Promise<void>
  writeVideoStream(workoutId: string, stream: ReadableStream): Promise<void>
  writeMetadata(workoutId: string, metadata: WorkoutMetadata): Promise<void>
  readMetadata(workoutId: string): Promise<WorkoutMetadata>
  listWorkouts(): Promise<string[]>
  getVideoBlob(workoutId: string): Promise<Blob>
  deleteWorkout(workoutId: string): Promise<void>
}
```

**Unit Tests** (in order):
1. test_checks_storage_availability - Validates OPFS support and available space
2. test_creates_workout_directory - Creates directory structure for workout
3. test_writes_metadata_json - Saves workout metadata as JSON file
4. test_reads_metadata_json - Retrieves and parses metadata
5. test_lists_workout_directories - Returns array of workout IDs
6. test_deletes_workout_and_contents - Removes directory and all files
7. test_handles_missing_directory - Returns empty array when no workouts exist
8. test_handles_corrupted_metadata - Returns null for invalid JSON

### Component: VideoStreamWriter
**Purpose**: Handles streaming video data to OPFS file
**Stories Covered**: STORY-001

**Public API**:
```typescript
interface VideoStreamWriter {
  startRecording(workoutId: string, mediaStream: MediaStream, quality: VideoQuality): Promise<void>
  stopRecording(): Promise<{ sizeInBytes: number }>
}

interface VideoQuality {
  width: number
  height: number
  bitrate: number
  frameRate: number
}
```

**Unit Tests** (in order):
1. test_creates_media_recorder_with_quality_settings - Validates MediaRecorder configuration
2. test_writes_chunks_to_opfs_file - Streams data without memory buffering
3. test_stops_recording_and_returns_size - Finalizes file and returns size
4. test_handles_mediastream_ended - Gracefully stops if stream ends
5. test_applies_video_quality_constraints - Uses provided quality settings

## Phase 2: Application Services

### Component: WorkoutStorageService
**Purpose**: Coordinates storage operations for workout lifecycle
**Stories Covered**: STORY-001, STORY-002

**Public API**:
```typescript
interface WorkoutStorageService {
  startVideoRecording(workoutId: string, mediaStream: MediaStream): Promise<void>
  stopRecording(workoutId: string, workoutData: WorkoutStats): Promise<void>
  getStoredWorkouts(): Promise<WorkoutSummary[]>
  getWorkoutVideo(workoutId: string): Promise<Blob>
  deleteWorkout(workoutId: string): Promise<void>
}

interface WorkoutSummary {
  workoutId: string
  startTime: Date
  endTime: Date
  duration: number
  totalReps: number
  rpm: number
  videoSizeInMB: number
}
```

**Unit Tests** (in order):
1. test_starts_video_recording_with_configured_quality - Uses quality from config
2. test_stops_recording_and_saves_metadata - Coordinates video stop and metadata save
3. test_transforms_workout_stats_to_metadata - Converts domain model to storage format
4. test_retrieves_workout_summaries - Maps stored data to summary format
5. test_sorts_workouts_by_date_descending - Returns newest workouts first
6. test_calculates_video_size_in_mb - Converts bytes to MB for display

### Component: CheckStorageUseCase
**Purpose**: Validates storage availability at app startup
**Stories Covered**: STORY-007

**Public API**:
```typescript
interface CheckStorageUseCase {
  execute(): Promise<StorageStatus>
}

interface StorageStatus {
  supported: boolean
  availableSpaceMB: number
  hasMinimumSpace: boolean
}
```

**Unit Tests** (in order):
1. test_returns_supported_true_when_opfs_available - Detects OPFS support
2. test_returns_supported_false_when_opfs_unavailable - Handles missing OPFS
3. test_checks_minimum_50mb_requirement - Validates against 50MB threshold
4. test_publishes_storage_warning_event - Emits event when space low

## Phase 3: Presentation Components

### Component: WorkoutHistoryDrawer
**Purpose**: Side drawer displaying workout history cards
**Stories Covered**: STORY-003

**Public API**:
```typescript
interface WorkoutHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
}
```

**UI Tests** (in order):
1. test_renders_drawer_closed_initially - Drawer hidden by default
2. test_slides_in_from_right_when_opened - Animation from right side
3. test_displays_loading_while_fetching_workouts - Shows spinner during load
4. test_renders_empty_state_message - Shows message when no workouts
5. test_closes_on_backdrop_click - Dismisses drawer on outside click
6. test_closes_on_escape_key - Keyboard navigation support

### Component: WorkoutCard
**Purpose**: Individual workout display with actions
**Stories Covered**: STORY-003, STORY-004, STORY-005, STORY-006

**Public API**:
```typescript
interface WorkoutCardProps {
  workout: WorkoutSummary
  onView: (workoutId: string) => void
  onDownload: (workoutId: string) => void
  onDelete: (workoutId: string) => void
}
```

**UI Tests** (in order):
1. test_displays_workout_stats - Shows date, reps, duration, RPM, size
2. test_formats_date_as_readable_string - User-friendly date display
3. test_shows_three_action_buttons - View, Download, Delete buttons visible
4. test_triggers_view_callback_on_click - Calls onView with workout ID
5. test_triggers_download_callback_on_click - Calls onDownload with workout ID
6. test_triggers_delete_callback_on_click - Calls onDelete with workout ID

### Component: DeleteConfirmationModal
**Purpose**: Confirmation dialog for workout deletion
**Stories Covered**: STORY-006

**Public API**:
```typescript
interface DeleteConfirmationModalProps {
  workout: WorkoutSummary | null
  onConfirm: () => void
  onCancel: () => void
}
```

**UI Tests** (in order):
1. test_renders_hidden_when_workout_null - Modal not visible initially
2. test_displays_workout_details - Shows date and size to be freed
3. test_shows_confirm_and_cancel_buttons - Both actions available
4. test_calls_confirm_on_delete_click - Triggers deletion callback
5. test_calls_cancel_on_cancel_click - Dismisses without action

### Component: WorkoutHistoryButton
**Purpose**: Button to open workout history drawer
**Stories Covered**: STORY-003

**Public API**:
```typescript
interface WorkoutHistoryButtonProps {
  onClick: () => void
}
```

**UI Tests** (in order):
1. test_renders_history_icon - Shows appropriate icon
2. test_triggers_click_handler - Opens drawer on click
3. test_shows_workout_count_badge - Optional badge with workout count

## Phase 4: Integration & Polish

### Component: useWorkoutHistory
**Purpose**: Hook for managing workout history state and actions
**Stories Covered**: STORY-003, STORY-004, STORY-005, STORY-006

**Public API**:
```typescript
interface UseWorkoutHistoryReturn {
  workouts: WorkoutSummary[]
  isLoading: boolean
  selectedWorkout: WorkoutSummary | null
  viewWorkout: (workoutId: string) => void
  downloadWorkout: (workoutId: string) => void
  deleteWorkout: (workoutId: string) => void
  confirmDelete: () => void
  cancelDelete: () => void
}
```

**Unit Tests** (in order):
1. test_loads_workouts_on_mount - Fetches from storage service
2. test_opens_video_in_new_tab - Creates blob URL and opens tab
3. test_triggers_browser_download - Creates download link with filename
4. test_shows_delete_confirmation - Sets selected workout for modal
5. test_deletes_and_refreshes_list - Removes workout and reloads
6. test_handles_loading_states - Manages isLoading flag

## Integration Points

- **PoseService → WorkoutService**: MediaStream passed when starting workout
- **WorkoutService → WorkoutStorageService**: Start/stop recording coordination
- **WorkoutStorageService → OPFSAdapter**: File operations delegation
- **WorkoutStorageService → VideoStreamWriter**: Video recording management
- **WorkoutHistoryDrawer → useWorkoutHistory**: State and action management
- **App → CheckStorageUseCase**: Storage validation at startup

## Risk Mitigation

- **Browser Compatibility**: OPFS requires modern browsers - show clear message when unsupported
- **Memory Usage**: Streaming approach prevents memory issues with large videos
- **Storage Pressure**: 50MB minimum check prevents recording failures
- **Data Loss**: Atomic operations - metadata written only after video finalized
- **Performance**: Video recording on separate thread via MediaRecorder API