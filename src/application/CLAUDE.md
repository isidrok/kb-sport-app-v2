# Claude Assistant Instructions - Application Layer

## Module Purpose
The application layer orchestrates business operations through use cases and coordinates them via application services. This layer contains the application's business logic and workflow coordination.

## Module Structure
```
src/application/
├── services/           # Application services that coordinate use cases
│   ├── pose.service.ts        # Shared pose detection service
│   ├── workout.service.ts     # Workout management service  
│   └── preview.service.ts     # Preview mode service
├── use-cases/         # Single-responsibility business operations
└── events/           # Application-level events
    └── preview-events.ts      # Preview mode events (consolidated)
```

## Module-Specific Rules

### Use Cases
- **Single Responsibility**: Each use case performs exactly one business operation
- **Pure Functions**: Use cases should be stateless and predictable
- **Error Handling**: Use cases throw descriptive errors for invalid operations
- **Dependencies**: Inject adapters and infrastructure through constructor

### Application Services
- **Coordination Role**: Services coordinate multiple use cases and maintain application state
- **State Management**: Services can maintain application state (like current workout)
- **Error Propagation**: Let use case errors bubble up to presentation layer
- **Shared Infrastructure**: PoseService provides shared pose detection for WorkoutService and PreviewService
- **Service Composition**: WorkoutService delegates pose operations to PoseService, focuses on workout lifecycle
- **Preview Mode**: PreviewService enables pose detection testing without workout creation

## Domain Rules (Application Layer)
- **Workout Lifecycle**: Only idle workouts can be started, only active workouts can be stopped
- **Camera Operations**: Video/canvas dimensions must be set before camera initialization (handled by PoseService)
- **Preview vs Workout**: Preview mode and workout mode are mutually exclusive
- **Pose Detection**: Shared pose detection infrastructure ensures consistent behavior
- **Event Publishing**: Services publish events for state changes (PreviewStartedEvent, PreviewStoppedEvent)
- **Entity Validation**: Use cases validate entity state before performing operations
- **Canvas Management**: Use renderer adapter for canvas clearing, not direct context manipulation

## Deviations from Global
- **Direct Adapter Access**: Application layer is the only layer that directly calls infrastructure adapters
- **Event Publishing**: Application layer use cases are responsible for publishing domain events
- **State Coordination**: Application services maintain transient application state (current workout, etc.)