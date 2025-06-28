# Claude Assistant Instructions - Application Layer

## Module Purpose
The application layer orchestrates business operations through use cases and coordinates them via application services. This layer contains the application's business logic and workflow coordination.

## Module Structure
```
src/application/
├── services/           # Application services that coordinate use cases
├── use-cases/         # Single-responsibility business operations
└── events/           # Application-level events
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
- **Dimension Setting**: Services handle video/canvas dimension setup before camera operations

## Domain Rules (Application Layer)
- **Workout Lifecycle**: Only idle workouts can be started, only active workouts can be stopped
- **Camera Operations**: Video/canvas dimensions must be set before camera initialization
- **Event Publishing**: Use cases publish events for async notifications to other layers
- **Entity Validation**: Use cases validate entity state before performing operations

## Deviations from Global
- **Direct Adapter Access**: Application layer is the only layer that directly calls infrastructure adapters
- **Event Publishing**: Application layer use cases are responsible for publishing domain events
- **State Coordination**: Application services maintain transient application state (current workout, etc.)