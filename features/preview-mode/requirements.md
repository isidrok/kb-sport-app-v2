# Preview Mode Requirements

## Overview
Preview mode allows users to verify their camera setup and pose detection is working correctly before starting a workout. This feature provides a risk-free way to ensure the system can detect their movements without creating workout records or counting reps.

## User Stories

### STORY-001: Start Preview Mode
As a user preparing for a workout
I want to preview my camera feed with pose detection
So that I can verify my setup is working before starting my workout

**Acceptance Criteria:**
1. Given the model is loaded and I'm on the workout screen, when I click "Start Preview", then the camera starts and pose detection begins
2. Given I'm in preview mode, when pose detection is running, then I see the same visual feedback as in workout mode (skeleton overlay)
3. Given I'm in preview mode, when I click "Start Preview", then the button text changes to "Stop Preview"
4. Given preview mode is active, when the system detects poses, then no workout is created and no reps are counted

**Edge Cases:**
- When the camera fails to start, then the error popup is displayed
- When the ML model isn't loaded yet, then clicking preview shows an appropriate error
- When the user denies camera permissions, then the error popup is displayed

### STORY-002: Stop Preview Mode
As a user in preview mode
I want to stop the preview
So that I can free up resources or prepare for other actions

**Acceptance Criteria:**
1. Given I'm in preview mode, when I click "Stop Preview", then the camera stops and canvas is cleared
2. Given I'm in preview mode, when I click "Stop Preview", then the button text changes back to "Start Preview"
3. Given I'm in preview mode, when I stop preview, then all pose detection processing stops

### STORY-003: Transition from Preview to Workout
As a user in preview mode
I want to start a workout without interruption
So that I can seamlessly transition from testing to exercising

**Acceptance Criteria:**
1. Given I'm in preview mode, when I click "Start Workout", then preview mode is disabled and workout begins seamlessly
2. Given I'm in preview mode, when I start a workout, then the camera and pose detection continue without interruption
3. Given I'm in preview mode, when I start a workout, then the preview button becomes disabled during the workout
4. Given a workout is active, when I try to click "Start Preview", then nothing happens (button is disabled)

### STORY-004: Return to Preview After Workout
As a user who just finished a workout
I want to use preview mode again
So that I can check my form or prepare for another workout

**Acceptance Criteria:**
1. Given I just stopped a workout, when the workout ends, then the "Start Preview" button is enabled again
2. Given I finished a workout, when I click "Start Preview", then preview mode starts normally

### STORY-005: Preview Button Placement
As a user on the workout screen
I want the preview button positioned intuitively
So that I can easily access it while understanding its relationship to the workout button

**Acceptance Criteria:**
1. Given I'm on the workout screen, when I look at the controls, then the preview button is positioned to the left of the start/stop workout button
2. Given both buttons are visible, when I view them, then they have consistent styling and clear labels

## Non-Functional Requirements

### Performance
- Preview mode should maintain the same frame processing rate as workout mode
- Transition between preview and workout should be seamless with no visible camera interruption

### State Management
- Preview mode and workout mode are mutually exclusive - only one can be active at a time
- The system should handle rapid button clicks gracefully without creating race conditions

### Error Handling
- All errors in preview mode should be handled identically to workout mode errors
- Error popups should provide clear, actionable messages

### User Experience
- The preview button should have clear visual states (enabled/disabled, start/stop)
- Visual feedback during preview should be identical to workout mode for consistency