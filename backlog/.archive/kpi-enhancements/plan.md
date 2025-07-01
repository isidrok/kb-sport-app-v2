# KPI Enhancements Implementation Plan

## Architecture Overview
Extend the existing workout tracking system with time and speed metrics by:
- Adding calculation methods to WorkoutEntity for elapsed time, average RPM, and current RPM
- Creating a WorkoutTimerUseCase that triggers WorkoutUpdatedEvent every second during active workouts
- Extending WorkoutStats interface with new metric fields and reps data
- Adding new WorkoutStatsCard instances to display the metrics

The implementation maintains clean architecture principles with business logic in the domain layer and uses the existing event-driven pattern for updates.

## Phase 1: Domain and Timer Infrastructure

### Component: WorkoutEntity Extensions
**Purpose**: Add methods to calculate time and speed metrics from existing rep data
**Stories Covered**: STORY-001, STORY-002, STORY-003

**Public API**:
```typescript
class WorkoutEntity {
  // Existing methods...
  
  // Private calculation methods
  private getElapsedTime(): number // milliseconds since start
  private getFormattedTime(): string // "mm:ss" format
  private getAverageRPM(): number // reps per minute from start
  private getCurrentRPM(windowSeconds: number = 20): number // reps per minute in window
  
  // Updated public method that includes everything
  getStats(): WorkoutStats // Returns all metrics in one call
}
```

**Unit Tests** (in order):
1. test_getStats_includes_elapsed_time_zero_when_not_started - Validates idle state
2. test_getStats_includes_elapsed_time_since_start - Validates active workout time
3. test_getStats_includes_duration_when_stopped - Validates stopped workout time
4. test_getStats_formats_time_correctly - Validates "mm:ss" format
5. test_getStats_formats_time_over_hour_correctly - Validates >59:59 formatting
6. test_getStats_includes_zero_rpm_with_no_reps - Validates empty state
7. test_getStats_calculates_average_rpm_from_start - Validates calculation logic
8. test_getStats_calculates_current_rpm_from_window - Validates 20-second window
9. test_getStats_uses_all_reps_when_workout_shorter_than_window - Validates short workouts
10. test_getStats_includes_reps_array - Validates reps data is included

### Component: WorkoutStats Interface Extension
**Purpose**: Add new metric fields and reps data to the stats object
**Stories Covered**: All stories

**Public API**:
```typescript
interface WorkoutStats {
  // Existing fields...
  status: WorkoutStatus
  startTime: Date | null
  endTime: Date | null
  isActive: boolean
  repCount: number
  
  // New fields
  elapsedTime: number // milliseconds
  formattedTime: string // "mm:ss"
  averageRPM: number
  currentRPM: number
  reps: Rep[] // Include actual rep data
}
```

### Component: WorkoutTimerUseCase
**Purpose**: Trigger periodic WorkoutUpdatedEvent during active workouts
**Stories Covered**: STORY-001, STORY-002, STORY-003

**Public API**:
```typescript
class WorkoutTimerUseCase {
  constructor(deps: {
    eventBus: EventBus
    workoutService: WorkoutService
  })
  
  start(): void
  stop(): void
}
```

**Unit Tests** (in order):
1. test_does_not_emit_events_when_workout_not_active - Validates idle behavior
2. test_emits_event_every_second_when_active - Validates timer frequency
3. test_stops_emitting_when_workout_stops - Validates cleanup
4. test_stop_clears_timer - Validates manual stop
5. test_handles_multiple_start_calls - Validates idempotency

## Phase 2: Application Layer Integration

### Component: WorkoutService Integration
**Purpose**: Initialize and manage WorkoutTimerUseCase lifecycle
**Stories Covered**: All stories

**Integration Points**:
- Start timer when workout starts
- Stop timer when workout stops
- Ensure WorkoutEntity.getStats() includes all new metrics

**Unit Tests** (in order):
1. test_starts_timer_on_workout_start - Validates timer initialization
2. test_stops_timer_on_workout_stop - Validates timer cleanup
3. test_workout_stats_include_all_metrics - Validates complete data flow

## Phase 3: Presentation Layer Components

### Component: WorkoutStats Component Update
**Purpose**: Display all KPI cards in a unified layout
**Stories Covered**: STORY-004, STORY-005

**UI Changes**:
```tsx
<WorkoutStats>
  <WorkoutStatsCard value={stats.repCount} label="Reps" />
  <WorkoutStatsCard value={stats.formattedTime} label="Time" />
  <WorkoutStatsCard value={`${stats.averageRPM} RPM`} label="Avg Speed" />
  <WorkoutStatsCard value={`${stats.currentRPM} RPM`} label="Current Speed" />
</WorkoutStats>
```

**UI Tests** (in order):
1. test_renders_all_kpi_cards - Validates card presence
2. test_displays_initial_values - Validates "00:00" and "0 RPM" defaults
3. test_updates_values_during_workout - Validates real-time updates
4. test_preserves_values_after_stop - Validates post-workout display

### Component: CSS Grid Layout Update
**Purpose**: Arrange KPI cards in responsive grid
**Stories Covered**: STORY-004

**CSS Updates**:
- Update `.overlay` grid to accommodate 4 cards
- Maintain responsive behavior on mobile
- Ensure consistent card spacing

## Integration Points
- WorkoutEntity connects to WorkoutService: Entity provides all calculations via single getStats() call
- WorkoutTimerUseCase connects to WorkoutService: Service manages timer lifecycle
- WorkoutService connects to UI: Complete stats flow through existing WorkoutUpdatedEvent pattern

## Risk Mitigation
- **Performance impact from timer**: Use single shared timer, batch event emissions
- **Memory from storing all reps**: Reps already stored, no additional memory impact
- **UI layout breaking**: Test responsive grid on various screen sizes
- **Timer accuracy**: Use Date.now() for calculations, not interval count

## Implementation Order
1. Extend WorkoutEntity with private calculation methods and updated getStats() (TDD)
2. Update WorkoutStats interface to include all fields
3. Create WorkoutTimerUseCase (TDD)
4. Integrate timer into WorkoutService
5. Update WorkoutStats component
6. Update CSS layout
7. Integration testing

Each phase delivers working functionality that can be tested independently. The single getStats() method ensures consumers get all data in one efficient call.