# Rep Detection Requirements

## Overview
Automatic repetition counting for overhead kettlebell lifts (jerk, snatch) using real-time pose detection. This feature enables home trainers to focus on their form while the system accurately counts repetitions during their workout sessions.

## User Stories

### STORY-001: Automatic Rep Counting for Overhead Lifts
As a home kettlebell trainer
I want the system to automatically count my overhead lift repetitions
So that I can focus on my form instead of counting during intense 10-minute sets

**Acceptance Criteria:**
1. Given the pose detection is active with confidence ≥ 0.5, when I move my wrist(s) from below nose (Y-coordinate) to above nose (Y-coordinate) and back down, then the system counts one repetition
2. Given I'm performing reps with both arms, when both wrists go above nose Y-coordinate, then it counts as one rep (not two)
3. Given I'm performing reps with one arm, when that wrist goes above nose Y-coordinate, then it counts as one rep
4. Given the minimum timing requirements are met (300ms down + 300ms up), when I complete the movement, then the rep is counted

**State Machine Requirements:**
- Initial state: Arms down (wrist Y below nose Y)
- Down state: Wrist(s) Y-coordinate below nose Y-coordinate for minimum 300ms
- Up state: Wrist(s) Y-coordinate above nose Y-coordinate for minimum 300ms
- Valid rep: Down (≥300ms) → Up (≥300ms) → Down
- Confidence threshold: Only process poses with confidence ≥ 0.5

**Edge Cases:**
- When both arms are detected going up, check both-arm condition first before individual arms to prevent double counting
- When only one wrist is visible during the movement, count the rep based on the visible wrist
- When confidence drops below 0.5 during movement, maintain current state until confidence returns
- When user holds position longer than 300ms, do not count additional reps until returning to down state

### STORY-002: Visual Feedback for Rep Counting
As a home kettlebell trainer
I want to see my rep count clearly during my workout
So that I know my progress without breaking concentration

**Acceptance Criteria:**
1. Given the rep detection is active, when I look at the screen, then I see a floating card with the current rep count
2. Given the UI theme uses glass effects, when the rep counter is displayed, then it matches the existing glass effect styling
3. Given a rep is counted, when the count updates, then the change is immediately visible in real-time

**Edge Cases:**
- When starting a workout, the counter shows "0" clearly
- When the count reaches double/triple digits, the display scales appropriately

### STORY-003: 100% Accuracy Requirement
As a home kettlebell trainer
I want the rep counting to be 100% accurate
So that I can trust the system for tracking my training volume

**Acceptance Criteria:**
1. Given proper pose detection (confidence ≥ 0.5), when I complete a full rep movement, then it is always counted
2. Given I complete one rep, when the system processes the movement, then it counts exactly one rep
3. Given the debounce mechanism is active, when rapid movements occur, then no double counting happens
4. Given incomplete movements or poses with confidence < 0.5, when processed, then no rep is counted

**Priority Checking Order:**
1. Check if both wrists are above nose → count as one rep
2. Check if left wrist is above nose → count as one rep
3. Check if right wrist is above nose → count as one rep

## Non-Functional Requirements

### Performance
- Real-time detection with no perceptible lag
- State transitions processed within one video frame
- Smooth UI updates without flickering

### Accuracy
- **CRITICAL**: 100% accuracy requirement
- Confidence threshold: 0.5 minimum for all pose keypoints used
- Debounce mechanism to prevent double counting
- State machine with 300ms minimum duration per state

### Reliability
- System handles single person detection only
- Continues functioning with partial visibility (only one wrist visible)
- Graceful handling of low confidence poses (ignore rather than miscount)

### User Interface
- Floating card with glass effect matching existing UI design
- Clear, large rep count display
- Positioned to not obstruct workout view

## Technical Constraints
- Built on existing TensorFlow.js YOLOv8 pose detection system
- Uses Y-coordinate comparison only (wrist.y vs nose.y)
- Integrates with current PoseService architecture
- Real-time processing of pose data stream

## Assumptions
- Users start with arms in down position
- Users complete movements without stopping mid-rep
- Single person in frame (no multi-person detection needed)
- Camera positioned to capture frontal or side view of user