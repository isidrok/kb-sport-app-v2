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
  subscribe<T extends Event>(eventType: string, listener: (event: T) => void): () => void
  publish<T extends Event>(eventType: string, event: T): void
  ```
- useEventBus hook enforces same constraint:
  ```typescript
  useEventBus<T extends Event>(eventType: string)
  ```

### Event Organization by Layer
- **Base Event class**: Lives in this module (`src/infrastructure/event-bus/`)
- **Application events**: `src/application/events/` (ModelLoading, CameraAccess)
- **Domain events**: `src/domain/events/` (WorkoutStatus)
- **Import pattern**: Always use `@/` path aliases

## Module Conventions

### EventBus Singleton Pattern
```typescript
// Single instance exported for app-wide usage
export const eventBus = new EventBus()
```

### Event Class Structure
```typescript
// Base class (lives here)
export abstract class Event<T = any> {
  constructor(public readonly data: T) {}
}

// Event implementations (live in respective layers)
export class ModelLoadingEvent extends Event<{
  status: 'loading' | 'ready' | 'error', 
  message?: string
}> {}
```

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
- `subscribe<T extends Event>(eventType: string, listener: (event: T) => void): () => void`
  - Returns unsubscribe function for cleanup
  - Supports multiple listeners per event type
- `publish<T extends Event>(eventType: string, event: T): void`
  - Calls all registered listeners for event type
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