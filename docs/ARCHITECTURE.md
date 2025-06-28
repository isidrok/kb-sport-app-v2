# Architecture Decisions

## Overview

This application follows Domain-Driven Design (DDD) with Clean Architecture to separate business logic from technical concerns. The architecture supports real-time pose detection for kettlebell workout tracking.

## Key Decisions

### Clean Architecture with DDD
**Date**: 2025-06-28  
**Context**: Need for maintainable, testable code that separates business logic from UI and infrastructure  
**Decision**: Implement Clean Architecture with DDD principles using distinct layers  
**Rationale**: 
- Domain logic independent of frameworks
- Testable business rules
- Clear separation of concerns
- Future extensibility for new exercise types
**Consequences**: 
- More files and structure complexity
- Clear boundaries between layers
- Easier testing and maintenance

### Event-Driven Communication with Type Safety
**Date**: 2025-06-28  
**Context**: Need async communication between ML model loading, camera access, and UI updates  
**Decision**: Implement EventBus in infrastructure layer with strict typed event classes  
**Rationale**: 
- Decouples components from direct dependencies
- Supports multiple subscribers for same events
- Clean async state management
- Type safety prevents runtime errors
- Future-proof for additional event types
**Consequences**: 
- Additional complexity for simple operations
- Clear async communication patterns
- Easier to add new event subscribers
- Compile-time event validation

### Event System Type Constraints
**Date**: 2025-06-28  
**Context**: Need to ensure all events follow consistent structure and prevent plain object usage  
**Decision**: Enforce `T extends Event` constraints in EventBus and useEventBus APIs  
**Rationale**: 
- Prevents accidental plain object publishing
- Ensures consistent event structure across application
- Compile-time validation of event types
- Clear separation between events and regular data
**Consequences**: 
- All events must extend base Event class
- TypeScript will catch improper event usage
- Consistent event patterns across codebase
- Additional type safety overhead

### Event Organization by Architecture Layer
**Date**: 2025-06-28  
**Context**: Events serve different purposes across clean architecture layers  
**Decision**: Organize events by their architectural responsibility  
**Rationale**: 
- Base Event class belongs in infrastructure (mechanism)
- Application events handle coordination between layers
- Domain events represent business state changes
- Clear ownership and responsibility
**Consequences**: 
- Event location indicates its purpose
- Clear import patterns using @/ aliases
- Maintainable event organization
- Easier to understand event scope

### Singleton Pattern for Services
**Date**: 2025-06-28  
**Context**: Need consistent state management across use cases and services  
**Decision**: Export all services and use cases as singletons  
**Rationale**: 
- Single source of truth for application state
- Consistent adapter instances
- Simplified dependency injection
**Consequences**: 
- Global state management
- Easier testing with known instances
- Potential testing isolation challenges

### Separate Camera from Workout Logic
**Date**: 2025-06-28  
**Context**: Future need for camera preview mode independent of workout sessions  
**Decision**: Create separate camera use cases independent of workout lifecycle  
**Rationale**: 
- Camera operations may be needed outside workouts
- Cleaner separation of concerns
- Supports future preview features
**Consequences**: 
- More granular use cases
- Additional coordination complexity
- Better feature extensibility

### Hook Splitting Pattern
**Date**: 2025-06-28  
**Context**: UI components need both state queries and action commands  
**Decision**: Split hooks into state (useWorkoutState) and actions (useWorkoutActions)  
**Rationale**: 
- Components can subscribe to only needed concerns
- Cleaner re-render optimization
- Single Responsibility Principle for hooks
**Consequences**: 
- More hooks to manage
- Clearer component dependencies
- Better performance optimization

### Video Buffer Management
**Date**: 2025-06-28  
**Context**: Canvas rendering corruption when video dimensions don't match client rect  
**Decision**: Set video/canvas dimensions from getBoundingClientRect before camera start  
**Rationale**: 
- Prevents internal buffer corruption
- Ensures proper canvas rendering
- Matches actual display dimensions
**Consequences**: 
- Additional setup step in camera initialization
- Reliable pose rendering
- Consistent visual output

## Layer Dependencies

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure ←──────┘
```

- **Presentation** depends on Application (use cases, services)
- **Application** depends on Domain (entities, types)
- **Infrastructure** provides implementations for Application interfaces
- **Domain** has no dependencies (pure business logic)

## Event Flow

```
LoadModelUseCase → EventBus → useModelLoading hook → StatusPopup
StartCameraUseCase → EventBus → useWorkoutActions hook → WorkoutControls  
WorkoutService → Domain Entity → useWorkoutState hook → UI Components
```

## Testing Strategy

### TDD Implementation Process
**Date**: 2025-06-28  
**Context**: Need consistent, reliable testing approach for complex domain logic  
**Decision**: Implement strict Test-Driven Development with RED-GREEN-REFACTOR cycles  
**Rationale**: 
- Ensures comprehensive test coverage
- Drives better API design
- Prevents over-engineering
- Forces focus on behavior over implementation
**Consequences**: 
- Development takes more upfront time
- Higher code quality and confidence
- Better documentation through tests
- Natural refactoring opportunities

### Testing Anti-Patterns
Established patterns to avoid:
- ❌ Testing return types (TypeScript handles this)
- ❌ Complex async mocking with importOriginal
- ❌ Technical test names (use natural language)
- ❌ Testing TypeScript constraints directly

### Layer-Specific Testing
- **Domain**: Unit tests for entities and business rules with natural language descriptions
- **Application**: Unit tests for use cases with mocked adapters
- **Infrastructure**: Integration tests for adapters, clean mocking with vi.mocked()
- **Presentation**: Component tests with Testing Library, focus on user interactions

Focus on behavior testing, not implementation details or CSS classes.