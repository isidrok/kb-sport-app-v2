# Claude Assistant Instructions - Application Layer

## Module Purpose
The application layer orchestrates business operations through use cases and coordinates them via application services. This layer contains the application's business logic and workflow coordination.

## Module Structure
```
src/application/
├── services/           # Application services that coordinate use cases
│   ├── *.service.ts   # Service implementations
│   └── *.service.test.ts # Service tests
├── use-cases/         # Single-responsibility business operations
│   ├── *-use-case.ts  # Use case implementations
│   └── *-use-case.test.ts # Use case tests
└── events/           # Application-level events
    └── *-event.ts    # Event definitions
```

## Module Conventions

### Use Cases
- **Single Responsibility**: Each use case performs exactly one business operation
- **Pure Functions**: Use cases should be stateless and predictable
- **Error Handling**: Use cases throw descriptive errors for invalid operations
- **Naming**: Use descriptive action-based names (`StartCameraUseCase`, `ProcessFrameUseCase`)
- **Dependencies**: Inject adapters and infrastructure through constructor
- **Export Pattern**: Export both class and singleton instance

### Application Services
- **Coordination Role**: Services coordinate multiple use cases and maintain application state
- **Constructor Pattern**: Use object-based dependency injection with interfaces
- **State Management**: Services can maintain application state (like current workout)
- **Error Propagation**: Let use case errors bubble up to presentation layer
- **Dimension Setting**: Services handle video/canvas dimension setup before camera operations

### Testing Patterns
- **Strict TDD**: Follow RED-GREEN-REFACTOR cycle for all implementations
- **Mock Strategy**: Use `Partial<Type> as Mocked<Type>` pattern for clean mocks
- **Behavior Testing**: Test behavior, not implementation details
- **Natural Language**: Use descriptive test names that explain the behavior

### Dependency Injection
```typescript
// ❌ Avoid: Multiple constructor parameters
constructor(
  private useCase1: UseCase1,
  private useCase2: UseCase2,
  private useCase3: UseCase3
) {}

// ✅ Prefer: Object-based injection
interface ServiceDependencies {
  useCase1: UseCase1
  useCase2: UseCase2
  useCase3: UseCase3
}

constructor(dependencies: ServiceDependencies) {
  this.useCase1 = dependencies.useCase1
  this.useCase2 = dependencies.useCase2
  this.useCase3 = dependencies.useCase3
}
```

## Domain Rules
- **Workout Lifecycle**: Only idle workouts can be started, only active workouts can be stopped
- **Camera Operations**: Video/canvas dimensions must be set before camera initialization
- **Event Publishing**: Use cases publish events for async notifications to other layers
- **Entity Validation**: Use cases validate entity state before performing operations

## Dependencies
- **Internal**: Domain entities, infrastructure adapters, event bus
- **External**: None (application layer is dependency-free of external libraries)

## Module Patterns

### Use Case Pattern
```typescript
export class ExampleUseCase {
  constructor(
    private adapter: ExampleAdapter,
    private eventBus: EventBus
  ) {}

  execute(input: InputType): OutputType {
    // 1. Validate input
    // 2. Perform business operation
    // 3. Publish events if needed
    // 4. Return result or throw error
  }
}

// Singleton export
export const exampleUseCase = new ExampleUseCase(
  exampleAdapter,
  eventBus
)
```

### Service Pattern
```typescript
interface ServiceDependencies {
  useCase1: UseCase1
  useCase2: UseCase2
}

export class ExampleService {
  private state: SomeState

  constructor(dependencies: ServiceDependencies) {
    // Assign dependencies
  }

  publicMethod(): void {
    // Coordinate use cases
    // Manage application state
  }

  private helperMethod(): void {
    // Extract complex logic
  }
}

// Singleton export
export const exampleService = new ExampleService({
  useCase1: useCase1Instance,
  useCase2: useCase2Instance
})
```

### Event Publishing Pattern
```typescript
// In use cases
this.eventBus.publish('EventType', new EventClass({
  status: 'success',
  data: result
}))
```

## Key Architectural Decisions
- **No Direct Adapter Calls**: Presentation layer never calls adapters directly, always through application layer
- **State Coordination**: Application services maintain transient application state (current workout, etc.)
- **Error Boundaries**: Use cases are the error boundaries - they validate and throw meaningful errors
- **Event-Driven Feedback**: Use events for async notifications rather than return values