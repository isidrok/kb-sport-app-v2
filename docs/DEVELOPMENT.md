# Development Guide

## Workflow

This project follows **Test-Driven Development (TDD)** with behavior-focused testing:

1. Write failing test for desired behavior
2. Implement minimal code to pass test
3. Refactor while keeping tests green
4. Repeat for next behavior

## Commands

```bash
# Development
pnpm dev          # Start dev server with host binding
pnpm build        # TypeScript compile + Vite build
pnpm tsc          # Type checking without emit
pnpm test         # Run Vitest tests
pnpm test:ui      # Run tests with Vitest UI
pnpm preview      # Preview production build
```

## Coding Conventions

### Architecture Patterns

**Domain-Driven Design:**
- Domain entities use getters for direct property access
- No methods unless required for business logic
- Use cases focus on single business operations
- Services coordinate multiple use cases
- All services/use cases exported as singletons

**Event System:**
- EventBus in infrastructure layer
- Event classes extend base `Event<T>` for type safety
- Methods named `publish` and `subscribe`
- Subscribe returns unsubscribe function

### File Organization

```
src/
├── domain/
│   ├── entities/          # Business entities (Workout)
│   └── types/            # Domain types (WorkoutStatus, WorkoutStats)
├── application/
│   ├── use-cases/        # Single-responsibility operations
│   └── services/         # Coordinate use cases
├── infrastructure/
│   ├── adapters/         # External integrations
│   └── event-bus/        # Event system
└── presentation/
    ├── hooks/            # State and action hooks
    └── components/       # UI components
```

### Naming Conventions

**Use Cases:** `[Verb][Noun]UseCase` (e.g., `StartWorkoutUseCase`)  
**Services:** `[Noun]Service` (e.g., `WorkoutService`)  
**Hooks:** `use[Noun][Type]` (e.g., `useWorkoutState`, `useWorkoutActions`)  
**Events:** `[Noun][Action]Event` (e.g., `ModelLoadingEvent`)  
**Components:** PascalCase (e.g., `WorkoutControls`)

### Hook Patterns

**Split State and Actions:**
```typescript
// State queries
function useWorkoutState(): WorkoutStats { }

// Action commands  
function useWorkoutActions(): WorkoutActions { }
```

**Event Hook Pattern:**
```typescript
function useEventBus<T>(eventType: string): {
  publish: (event: T) => void
  subscribe: (listener: (event: T) => void) => void
}

// Usage
const {publish, subscribe} = useEventBus('ModelLoading');
```

### Component Patterns

**Canvas/Video Setup:**
```typescript
// Always set dimensions before camera start
const rect = videoElement.getBoundingClientRect();
videoElement.width = rect.width;
videoElement.height = rect.height;
canvasElement.width = rect.width; 
canvasElement.height = rect.height;
```

**Reference Passing:**
```typescript
// Components receive refs, not elements
interface WorkoutControlsProps {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
}
```

### Testing Guidelines

**Test Behavior, Not Implementation:**
- Focus on public APIs and expected outcomes
- Mock external dependencies (adapters)
- No testing of CSS classes or styling
- Test state changes and side effects

**Test Organization:**
```typescript
// Use cases: Mock adapters, test business logic
test_[behavior]_[expected_outcome]

// Services: Mock use cases, test coordination
test_[operation]_[calls_expected_dependencies]

// Hooks: Test state changes and cleanup
test_[hook]_[state_change_behavior]
```

## Domain Rules

### Workout Entity
- Must be in `idle` status to start
- Must be in `active` status to stop  
- Starting sets `startTime` and `active` status
- Stopping sets `endTime` and `stopped` status

### Camera Management
- Independent of workout lifecycle
- Dimensions must be set before starting
- Proper cleanup on stop

### Event System
- All async operations use EventBus
- Events are typed with specific data payloads
- UI subscribes to events, business logic publishes

## Error Handling

**Camera Errors:** Tell users to fix permissions, don't retry automatically  
**Model Errors:** Show permanent error state, require page reload  
**Validation Errors:** Throw domain-specific errors from use cases