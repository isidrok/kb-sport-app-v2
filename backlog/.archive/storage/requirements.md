# OPFS Video Recording & Workout Storage Requirements

## Overview
Implement OPFS-based video recording and workout data storage for the kettlebell workout tracking application. Users can record their workout sessions with synchronized video and rep data, then review, download, or delete previous workouts through a dedicated history page.

## User Stories

### STORY-001: Record Workout Session with Video
As a user performing a kettlebell workout
I want my workout session to be automatically recorded as video
So that I can review my form and track my progress over time

**Acceptance Criteria:**
1. Given a workout is started, when video recording begins, then a video file is streamed to `/kb-sport-app/workout-{id}/video` in OPFS
2. Given video recording is active, when reps are detected, then rep data with timestamps is collected alongside the video
3. Given a workout is completed, when the session ends, then the video file is finalized and closed
4. Given WebM format is used for video recording with 720p resolution at 30fps
5. Given a workout session, when it ends, then a metadata.json file is created with workout statistics

**Edge Cases:**
- When OPFS is not supported, then show modal warning that video recording is unavailable
- When available storage is less than 50MB, then show modal warning about insufficient space
- When video recording fails, then continue workout tracking without video

### STORY-002: Store Workout Metadata
As a user completing a workout
I want my workout statistics and rep details to be saved
So that I can analyze my performance and progress

**Acceptance Criteria:**
1. Given a completed workout, when metadata is saved, then it includes start time, total repetitions, RPM, and duration
2. Given rep detection during workout, when each rep is completed, then rep timestamp and details are recorded
3. Given metadata collection, when workout ends, then data is saved as lightweight JSON format
4. Given metadata structure, when saved, then it follows the format:
   ```json
   {
     "workoutId": "workout_2024-07-01T10:30:00.000Z",
     "startTime": "2024-07-01T10:30:00.000Z",
     "endTime": "2024-07-01T10:45:30.000Z",
     "duration": 930,
     "totalReps": 45,
     "rpm": 2.9,
     "reps": [
       {"timestamp": 1234567890, "repNumber": 1, "duration": 2.1},
       {"timestamp": 1234567892, "repNumber": 2, "duration": 2.0}
     ],
     "videoSize": 15728640
   }
   ```

**Edge Cases:**
- When metadata writing fails, then retry once and log error if still failing
- When rep detection is inconsistent, then still save available rep data

### STORY-003: Display Workout History
As a user who has completed multiple workouts
I want to see a list of my previous workout sessions
So that I can track my progress and access recorded videos

**Acceptance Criteria:**
1. Given stored workouts exist, when accessing workout history page, then display workout cards sorted by date (newest first)
2. Given a workout card, when displayed, then show date, total reps, duration, RPM, and file size
3. Given workout cards, when rendered, then each card shows three action buttons: View Video, Download, Delete
4. Given the history page, when no workouts exist, then display empty state message
5. Given workout data loading, when accessing history, then show loading indicator

**Edge Cases:**
- When metadata file is corrupted, then show card with "Data unavailable" message
- When video file is missing but metadata exists, then disable "View Video" and "Download" actions
- When OPFS access fails, then show error message on history page

### STORY-004: View Workout Video
As a user reviewing my workout history
I want to watch the recorded video of a specific workout
So that I can analyze my form and technique

**Acceptance Criteria:**
1. Given a workout card with available video, when "View Video" is clicked, then open video in new browser tab
2. Given video playback, when opened, then video plays with standard browser controls
3. Given video file access, when opening video, then stream directly from OPFS without copying to memory
4. Given video viewing, when tab is opened, then page title shows workout date and duration

**Edge Cases:**
- When video file is corrupted, then show error message in new tab
- When OPFS access fails during video load, then display appropriate error message
- When video file is very large, then show loading indicator while streaming starts

### STORY-005: Download Workout Video
As a user wanting to keep a local copy
I want to download the video file of a specific workout
So that I can store it permanently or share it with others

**Acceptance Criteria:**
1. Given a workout card with available video, when "Download" is clicked, then trigger browser download of video file
2. Given video download, when initiated, then filename format is `workout_YYYY-MM-DD_HH-mm-ss.webm`
3. Given download process, when started, then show download progress if possible
4. Given large video files, when downloading, then use streaming download to avoid memory issues

**Edge Cases:**
- When download fails due to browser restrictions, then show error message with alternative instructions
- When video file is very large, then warn user about file size before download
- When insufficient local storage for download, then show appropriate error message

### STORY-006: Delete Workout Data
As a user managing my storage space
I want to delete specific workout recordings
So that I can free up space and remove unwanted sessions

**Acceptance Criteria:**
1. Given a workout card, when "Delete" is clicked, then show confirmation dialog with workout details
2. Given delete confirmation, when confirmed, then remove both video file and metadata.json from OPFS
3. Given successful deletion, when completed, then remove workout card from history page immediately
4. Given delete operation, when completed, then show brief success notification
5. Given delete dialog, when showing confirmation, then display file size being freed

**Edge Cases:**
- When delete operation fails, then show error message and keep workout card visible
- When only metadata exists (no video), then delete available data and notify user
- When user cancels deletion, then return to history page with no changes

### STORY-007: Handle Storage Limitations
As a user with limited device storage
I want to be informed about storage constraints
So that I can make informed decisions about recording workouts

**Acceptance Criteria:**
1. Given workout start, when available storage is less than 50MB, then show modal warning about recording limitations
2. Given storage check, when OPFS is unsupported, then show modal explaining video recording is unavailable
3. Given storage warnings, when displayed, then provide option to continue without recording or cancel workout
4. Given storage estimation, when warning shown, then indicate approximately how many minutes can be recorded

**Edge Cases:**
- When storage check fails, then assume limited storage and show warning
- When storage becomes full during recording, then gracefully stop recording and save available data
- When OPFS access is denied, then treat as unsupported and show appropriate message

## Non-Functional Requirements

### Performance
- Video recording should not significantly impact pose detection performance
- Workout history page should load within 2 seconds for up to 100 stored workouts
- Video playback should start streaming within 3 seconds

### Storage
- Estimated video size: ~1.5MB per minute for 720p WebM (15MB for 10-minute workout)
- Minimum storage check: 50MB available space before allowing recording
- Metadata files should be under 5KB each

### Browser Support
- OPFS support required (Chrome 86+, Firefox 111+, Safari 15.2+)
- Graceful degradation when OPFS unavailable
- Standard video playback support for recorded content

### Security & Privacy
- All data stored locally on user device
- No automatic upload or external transmission
- User controls all data retention and deletion

### Usability
- Clear visual feedback during recording
- Intuitive workout history interface
- Accessible error messages and warnings
- Consistent file naming conventions