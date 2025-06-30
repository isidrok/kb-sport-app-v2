# Rep Detection Implementation Plan

## Architecture Overview

The rep detection feature will be built using a domain-driven approach with a state machine at its core. The `RepDetectionService` in the domain layer will encapsulate all rep counting logic, ensuring 100% accuracy through a well-tested state machine. The service will be integrated into the existing pose processing pipeline via `DetectRepUseCase`, which will be called by `WorkoutService` after frame processing.

**Data Flow**:
```
ProcessFrameUseCase → PoseData → WorkoutService → DetectRepUseCase → RepDetectionService → WorkoutEntity
                                                                            ↓
                                                                    RepDetectionStateMachine
```

**Event Flow for UI Updates**:
```
DetectRepUseCase → WorkoutStatusEvent → useWorkoutState → UI Components
```

## Phase 1: Domain Layer - Rep Detection Core

### Component: Rep Type Addition
**Purpose**: Type definition for repetition data in workout types
**Stories Covered**: STORY-001 (rep data structure)

**Type Definition** (in workout types):
```typescript
export type Rep = {
  hand: 'left' | 'right' | 'both'
  timestamp: Date
}
```

### Component: WorkoutEntity Enhancement
**Purpose**: Store repetitions as part of workout data
**Stories Covered**: STORY-001 (rep storage)

**Public API Enhancement**:
```typescript
interface WorkoutEntity {
  // existing properties...
  get reps(): Rep[]
  
  addRep(rep: Rep): void
  getRepCount(): number
}
```

**Unit Tests** (in order):
1. test_workout_starts_with_empty_reps - Initial state validation
2. test_add_rep_increases_count - Adding reps updates array
3. test_get_rep_count_returns_total - Count matches array length

### Component: RepDetectionStateMachine
**Purpose**: Encapsulates the state transition logic for detecting valid repetitions
**Stories Covered**: STORY-001 (state machine requirements)

**Public API**:
```typescript
interface RepDetectionStateMachine {
  processKeypoints(keypoints: RepKeypoints): StateTransitionResult
  getCurrentState(): RepState
  reset(): void
}

interface RepKeypoints {
  noseY: number
  leftWristY: number
  rightWristY: number
  leftWristConfidence: number
  rightWristConfidence: number
  noseConfidence: number
}

interface StateTransitionResult {
  repDetected: boolean
  hand?: 'left' | 'right' | 'both'
}

type RepState = 'down' | 'up'
```

**Unit Tests** (in order):
1. test_initial_state_is_down - Validates machine starts in down state
2. test_stays_in_down_when_wrists_below_nose - No transition when wrists stay below nose
3. test_transitions_to_up_when_wrists_above_nose - State changes after 300ms threshold
4. test_detects_rep_on_up_to_down_transition - Rep counted after full cycle
5. test_both_hands_priority_over_single - Both-hand detection takes precedence
6. test_left_hand_priority_over_right - Left checked before right in single-hand case
7. test_ignores_low_confidence_keypoints - Keypoints below 0.5 confidence ignored
8. test_maintains_state_during_low_confidence - State preserved when confidence drops
9. test_timing_requirement_300ms_down - Must stay down for 300ms minimum
10. test_timing_requirement_300ms_up - Must stay up for 300ms minimum
11. test_no_double_counting_on_hold - Holding position doesn't count multiple reps

### Component: RepDetectionService
**Purpose**: Domain service coordinating rep detection using the state machine
**Stories Covered**: STORY-001, STORY-003 (100% accuracy)

**Public API**:
```typescript
interface RepDetectionService {
  detectRep(prediction: Prediction): Rep | null
  reset(): void
}

interface RepDetectionServiceDependencies {
  stateMachine: RepDetectionStateMachine
}
```

**Unit Tests** (in order):
1. test_returns_null_when_no_rep_detected - No false positives
2. test_returns_rep_when_detected - Successful detection
3. test_extracts_keypoints_from_prediction - Correct keypoint mapping
4. test_handles_missing_keypoints - Graceful null handling
5. test_reset_clears_state_machine - Reset functionality

## Phase 2: Application Layer - Use Cases

### Component: DetectRepUseCase
**Purpose**: Bridge between application services and domain rep detection
**Stories Covered**: STORY-001 (integration with pose processing)

**Public API**:
```typescript
interface DetectRepUseCase {
  execute(params: DetectRepParams): DetectRepResult
}

interface DetectRepParams {
  prediction: Prediction
  workoutId: string
}

interface DetectRepResult {
  repDetected: boolean
  totalReps: number
}
```

**Critical**: Must emit `WorkoutStatusEvent` when rep is added to trigger UI updates

**Unit Tests** (in order):
1. test_calls_rep_detection_service - Integration with domain service
2. test_adds_rep_to_workout_when_detected - Workout entity update
3. test_emits_workout_status_event_on_rep_add - Event emission for UI reactivity
4. test_returns_updated_rep_count - Accurate count returned
5. test_handles_workout_not_found - Error case handling

### Component: WorkoutStats Enhancement
**Purpose**: Add rep count to existing workout stats
**Stories Covered**: STORY-002 (displaying rep count)

**Enhanced Interface**:
```typescript
export interface WorkoutStats {
  status: WorkoutStatus
  startTime: Date | null
  endTime: Date | null
  canStart: boolean
  canStop: boolean
  repCount: number // NEW
}
```

**Unit Tests** (in order):
1. test_includes_rep_count_in_stats - Rep count included in stats
2. test_rep_count_updates_with_workout_changes - Reactive to workout updates

### Component: WorkoutService Enhancement
**Purpose**: Integrate rep detection into frame processing pipeline
**Stories Covered**: STORY-001 (automatic counting)

**Integration Points**:
- After `processFrame()`, call `detectRepUseCase.execute()` with the prediction
- Only process when workout is active (not in preview mode)

**Unit Tests** (in order):
1. test_calls_detect_rep_after_frame_processing - Integration flow
2. test_skips_detection_in_preview_mode - Preview isolation
3. test_continues_on_detection_error - Error resilience

## Phase 3: Presentation Layer - UI Components

### Component: WorkoutStatsCard (Generic)
**Purpose**: Generic card component for displaying workout statistics
**Stories Covered**: STORY-002 (visual feedback)

**Public API**:
```typescript
interface WorkoutStatsCardProps {
  value: string | number
  label: string
  className?: string
}
```

**UI Tests** (in order):
1. test_renders_value_and_label - Displays props correctly
2. test_handles_numeric_values - Number formatting
3. test_handles_string_values - String display
4. test_applies_custom_className - CSS class handling

### Component: WorkoutStats
**Purpose**: Container component managing stats display with existing useWorkoutState
**Stories Covered**: STORY-002 (floating card positioning)

**Public API**:
```typescript
interface WorkoutStatsProps {
  workoutId: string
}
```

**Implementation Notes**:
- Uses existing `useWorkoutState()` hook for reactive updates
- No need for new hook since WorkoutStatusEvent already triggers updates
- Renders multiple `WorkoutStatsCard` components for different stats

**UI Tests** (in order):
1. test_renders_rep_count_card - Rep count display
2. test_uses_existing_workout_state_hook - Integration with existing state
3. test_updates_on_workout_status_event - Real-time updates via existing event system
4. test_positions_as_floating_overlay - CSS positioning

## Phase 4: Integration Testing

### Integration Test Suite
**Purpose**: Validate end-to-end rep detection accuracy
**Stories Covered**: STORY-003 (100% accuracy requirement)

**Integration Tests**:
1. test_complete_rep_cycle_detection - Full down-up-down cycle
2. test_both_hands_counted_as_one - No double counting
3. test_timing_requirements_enforced - 300ms thresholds work
4. test_confidence_filtering_works - Low confidence ignored
5. test_ui_updates_via_existing_event_system - WorkoutStatusEvent triggers UI updates

## Integration Points

- **RepDetectionService** → **RepDetectionStateMachine**: Service delegates state management
- **DetectRepUseCase** → **RepDetectionService**: Use case calls domain service
- **DetectRepUseCase** → **WorkoutRepository**: Updates workout entity
- **DetectRepUseCase** → **EventBus**: Emits WorkoutStatusEvent for UI updates
- **WorkoutService** → **DetectRepUseCase**: Calls after frame processing
- **ProcessFrameUseCase** → **WorkoutService**: Provides prediction data
- **WorkoutStats** → **useWorkoutState**: Uses existing hook for reactive state
- **useWorkoutState** → **WorkoutStatusEvent**: Existing subscription handles rep updates
- **WorkoutEntity** → **Rep**: Entity stores rep array

## Risk Mitigation

- **Timing accuracy**: Use `performance.now()` for millisecond precision
- **State consistency**: State machine ensures no invalid transitions
- **Performance**: Process only when confidence threshold met
- **Double counting**: Priority checking (both → left → right) prevents duplicates
- **Partial visibility**: Handle cases where only one wrist is visible
- **Low confidence**: Maintain state during temporary confidence drops
- **UI reactivity**: Leverage existing WorkoutStatusEvent system for real-time updates