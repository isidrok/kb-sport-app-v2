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

## Module-Specific Rules

### Event Constraint Enforcement (MANDATORY)
- **ALL** events MUST extend base `Event<T>` class
- EventBus methods enforce `T extends Event` constraints
- useEventBus hook enforces same constraint
- **IMPORTANT**: Import Event from `@/infrastructure/event-bus/event` not `event-bus`

### EventBus API (v2)
The EventBus uses event classes as tokens instead of strings:
- **Current**: `eventBus.publish(event)` and `eventBus.subscribe(EventClass, listener)`
- **Old**: `eventBus.publish('event-type', event)` and `eventBus.subscribe('event-type', listener)`

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

### EventBus Singleton Pattern
```typescript
// Single instance exported for app-wide usage
export const eventBus = new EventBus()
```

## Deviations from Global
- **No Dependencies**: This is a foundation module with no internal dependencies
- **Type Safety Foundation**: Provides base Event class that other modules extend
- **Singleton Export**: EventBus is exported as singleton for app-wide usage