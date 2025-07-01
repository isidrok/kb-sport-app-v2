# KPI Enhancements Requirements

## Overview
Enhance the existing KPI section with additional workout performance metrics to provide users with comprehensive real-time feedback during their kettlebell workouts. This feature adds three new KPI cards to complement the existing total reps display.

## User Stories

### STORY-001: View Total Workout Time
As a user performing a kettlebell workout
I want to see the total elapsed time in mm:ss format
So that I can track how long I've been exercising and manage my workout duration

**Acceptance Criteria:**
1. Given a workout is started, when I look at the KPI section, then I see a "Total Time" card displaying "00:00"
2. Given a workout is in progress, when time passes, then the total time updates every second in mm:ss format
3. Given a workout runs continuously, when I take breaks or pause between reps, then the timer continues running without pausing
4. Given a workout is stopped, when I view the KPI section, then the total time shows the final elapsed time

### STORY-002: View Average Speed (RPM)
As a user performing a kettlebell workout
I want to see my average repetition speed in RPM
So that I can monitor my overall workout intensity and pacing consistency

**Acceptance Criteria:**
1. Given a workout is started, when I look at the KPI section, then I see an "Avg Speed" card displaying "0 RPM"
2. Given reps are being performed, when I complete repetitions, then the average RPM is calculated from workout start to current time
3. Given multiple exercises in one workout, when I switch exercises, then the average speed continues calculating across all exercises
4. Given a workout is in progress, when the average speed is calculated, then it updates in real-time as new reps are completed

### STORY-003: View Current Speed (RPM)
As a user performing a kettlebell workout
I want to see my current repetition speed based on the last 20 seconds
So that I can monitor my immediate pacing and adjust my intensity in real-time

**Acceptance Criteria:**
1. Given a workout is started, when I look at the KPI section, then I see a "Current Speed" card displaying "0 RPM"
2. Given reps are being performed, when I complete repetitions, then the current RPM is calculated using only reps from the last 20 seconds
3. Given more than 20 seconds have passed, when calculating current speed, then only the most recent 20 seconds of data is used
4. Given less than 20 seconds of workout time, when calculating current speed, then all available data from workout start is used
5. Given no reps in the last 20 seconds, when displaying current speed, then it shows "0 RPM"

### STORY-004: KPI Cards Display Integration
As a user performing a kettlebell workout
I want to see all KPI metrics in a consistent, organized layout
So that I can quickly scan my performance data without distraction

**Acceptance Criteria:**
1. Given the workout page is loaded, when I view the KPI section, then I see all KPI cards (existing + new) in a unified layout
2. Given a workout is not started, when I view KPI cards, then all new cards show initial values (time: "00:00", speeds: "0 RPM")
3. Given KPI cards are displayed, when the layout renders, then all cards follow consistent styling and spacing
4. Given the existing total reps card, when new cards are added, then they integrate seamlessly without disrupting current functionality

### STORY-005: View Post-Workout Summary
As a user who has completed a kettlebell workout
I want to see all my final KPI metrics remain on screen after stopping the workout
So that I can review my performance and record or share my results

**Acceptance Criteria:**
1. Given a workout is stopped, when I view the KPI section, then all KPI values remain visible with their final values
2. Given a workout is stopped, when the timer was running, then the total time displays the final workout duration and stops updating
3. Given a workout is stopped, when speed metrics were calculated, then both average and current speed show their final calculated values
4. Given a workout is stopped, when viewing the KPIs, then the display remains stable until a new workout is started
5. Given KPIs are showing post-workout values, when I start a new workout, then all KPIs reset to their initial values

## Non-Functional Requirements

### Performance
- KPI calculations must not impact pose detection performance
- Display updates should be smooth with no visible lag or flickering
- Speed calculations should be efficient and not cause frame rate drops

### Usability
- Time format must be clearly readable (mm:ss)
- RPM values should be displayed as whole numbers for clarity
- KPI cards should maintain visual consistency with existing design system
- Post-workout KPI values must be clearly final (no ambiguity about whether workout is still running)

### Technical
- All calculations must work with the existing rep detection system
- New KPIs should integrate with current workout state management
- Implementation should follow existing clean architecture patterns
- KPI state must persist properly when transitioning from active to stopped workout

## Implementation Notes
- Total reps functionality already exists and should remain unchanged
- New KPI cards will be added to the existing KPI section layout
- All KPIs display continuously during workout (no conditional visibility)
- Speed calculations depend on accurate rep detection and timing data
- Post-workout state management must ensure values don't reset unexpectedly