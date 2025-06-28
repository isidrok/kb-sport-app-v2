# Claude Assistant Instructions - Event Bus Module

## Module Purpose
Provides type-safe event communication system for async layer coordination in clean architecture.

## Module Structure
```
src/infrastructure/event-bus/
├── event-bus.ts         # EventBus class and base Event class
├── event-bus.test.ts    # EventBus tests
└── CLAUDE.md           # This file
```

## Critical Type Safety Rules

### Event Constraint Enforcement (MANDATORY)
- **ALL** events MUST extend base `Event<T>` class
- EventBus methods enforce `T extends Event` constraints:
  ```typescript
  subscribe<T extends Event>(eventClass: new (...args: any[]) => T, listener: (event: T) => void): () => void
  publish<T extends Event>(event: T): void
  ```
- useEventBus hook enforces same constraint:
  ```typescript
  useEventBus<T extends Event>(eventClass: new (...args: any[]) => T)
  ```

### Event Organization by Layer
- **Base Event class**: Lives in separate file (`src/infrastructure/event-bus/event.ts`)
- **Application events**: `src/application/events/` (ModelLoading, CameraAccess)
- **Domain events**: `src/domain/events/` (WorkoutStatus)
- **Import pattern**: Always use `@/` path aliases
- **IMPORTANT**: Import Event from `@/infrastructure/event-bus/event` not `event-bus`

## Module Conventions

### EventBus Singleton Pattern
```typescript
// Single instance exported for app-wide usage
export const eventBus = new EventBus()
```

### Event Class Structure
```typescript
// Base class (lives in event.ts)
export abstract class Event<T = any> {
  constructor(public readonly data: T) {}
}

// Event implementations (live in respective layers)
export class ModelLoadingEvent extends Event<{
  status: 'loading' | 'ready' | 'error', 
  message?: string
}> {}
```

### EventBus API Changes (v2)
The EventBus now uses event classes as tokens instead of strings:
- **Old**: `eventBus.publish('event-type', event)` 
- **New**: `eventBus.publish(event)`
- **Old**: `eventBus.subscribe('event-type', listener)`
- **New**: `eventBus.subscribe(EventClass, listener)`

This provides better type safety and eliminates string-based errors.

### Testing Patterns

**DO**: Simple mocking with vi.mocked()
```typescript
vi.mock('@/infrastructure/event-bus/event-bus')
const mockEventBus = vi.mocked(eventBus)

beforeEach(() => {
  vi.clearAllMocks()
  mockEventBus.subscribe.mockReturnValue(mockUnsubscribe)
})
```

**DON'T**: Complex async mocking patterns
```typescript
// ❌ Avoid this complexity
vi.mock('@/path', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, eventBus: { ... } }
})
```

## Dependencies
- **External**: None (pure TypeScript)
- **Internal**: None (foundation module)

## API Documentation

### EventBus Class
- `subscribe<T extends Event>(eventClass: new (...args: any[]) => T, listener: (event: T) => void): () => void`
  - Takes event class constructor as first parameter
  - Returns unsubscribe function for cleanup
  - Supports multiple listeners per event type
- `publish<T extends Event>(event: T): void`
  - Takes event instance directly
  - Uses event's constructor as key internally
  - Type-safe with Event constraint

### Base Event Class
- `constructor(public readonly data: T)`
  - Immutable data storage
  - Generic type parameter for payload

## Module Patterns

### Memory Management
- Subscribe returns cleanup function
- Listeners stored in Map<string, Function[]>
- Automatic cleanup in useEventBus hook via useEffect

### Type Safety Enforcement
- Generic constraints prevent plain object usage
- Compile-time enforcement of Event inheritance
- Consistent API across EventBus and hooks