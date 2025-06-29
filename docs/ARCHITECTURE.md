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

### Shared Service Pattern for Pose Detection
**Date**: 2025-06-29  
**Context**: Need to support both workout mode and preview mode with consistent pose detection behavior  
**Decision**: Create PoseService as shared infrastructure used by both WorkoutService and PreviewService  
**Rationale**: 
- Eliminates code duplication between workout and preview modes
- Ensures consistent pose detection behavior across features
- Centralizes camera operations, dimension setup, and frame processing
- Single responsibility: pose detection concerns separated from business logic
- Enables seamless transitions between preview and workout modes
**Consequences**: 
- WorkoutService simplified to focus on workout lifecycle management
- PreviewService enables pose detection testing without workout creation
- Shared dependency requires coordination between services
- Consistent user experience across preview and workout modes

### Preview Mode Architecture
**Date**: 2025-06-29  
**Context**: Users need to test camera setup and pose detection before starting workouts  
**Decision**: Implement preview mode as separate service with shared pose detection infrastructure  
**Rationale**: 
- Risk-free testing of pose detection setup
- Independent state management prevents interference with workout mode
- Reuses existing pose detection pipeline for consistency
- Event-driven state changes enable UI coordination
**Consequences**: 
- Preview and workout modes are mutually exclusive
- Separate PreviewService maintains preview state
- PreviewStartedEvent and PreviewStoppedEvent published for UI updates
- No workout records created during preview mode

### Event Consolidation Pattern
**Date**: 2025-06-29  
**Context**: Multiple related events (PreviewStartedEvent, PreviewStoppedEvent) needed organization  
**Decision**: Group related events in single files (e.g., preview-events.ts) without explicit constructors  
**Rationale**: 
- Reduces file proliferation for simple events
- Base Event<T> constructor handles data initialization automatically
- Easier to maintain related events together
- Simplified event class declarations
**Consequences**: 
- Related events grouped logically in single files
- Simpler event class syntax without boilerplate constructors
- Event data interfaces still provide type safety
- Import statements simplified for related events
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

### Presentation Layer Organization
**Date**: 2025-06-28  
**Context**: Need clear separation between shared components and feature-specific presentation logic  
**Decision**: Organize presentation layer with explicit shared vs feature-specific boundaries  
**Rationale**: 
- Shared components (StatusPopup) are truly reusable across features
- Feature-specific components (WorkoutControls) belong with their domain
- App-level hooks (useEventBus, useModelLoading) serve multiple features
- Feature hooks (useWorkoutState, useWorkoutActions) are domain-specific
- Clear import patterns prevent circular dependencies
**Consequences**: 
- Better code organization and discoverability
- Cleaner separation of concerns
- Easier to identify reusable vs feature-specific code
- Consistent import patterns across features
- Scalable architecture for future features

### useEventBus Hook Simplification
**Date**: 2025-06-28  
**Context**: Initial useEventBus had complex automatic cleanup with ref tracking causing confusion  
**Decision**: Simplify to manual subscription pattern where consumers manage cleanup  
**Rationale**: 
- Explicit is better than implicit for lifecycle management
- Reduces hook complexity and internal state
- Follows React patterns where consumers control effect cleanup
- Easier to understand and debug
- Avoids Rules of Hooks violations from attempting useEffect inside useCallback
**Consequences**: 
- Slightly more verbose consumer code
- Clear ownership of subscription lifecycle
- No hidden internal state or complex cleanup logic
- Better performance due to simpler hook implementation
- Consistent with React ecosystem patterns